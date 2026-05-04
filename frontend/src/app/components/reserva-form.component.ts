import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReservaService } from '../services/reserva.service';
import { catchError, map, of, debounceTime, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <h2>Crear Reserva</h2>
      
      <form [formGroup]="reservaForm" (ngSubmit)="onSubmit()" aria-labelledby="form-title">
        <div class="form-group">
          <label for="fecha">Fecha</label>
          <input id="fecha" type="date" formControlName="fecha" 
                 [attr.aria-invalid]="reservaForm.get('fecha')?.invalid"
                 aria-describedby="fecha-error">
          <div id="fecha-error" class="error" *ngIf="reservaForm.get('fecha')?.touched && reservaForm.get('fecha')?.errors">
            <span *ngIf="reservaForm.get('fecha')?.errors?.['required']">La fecha es requerida</span>
          </div>
        </div>

        <div class="form-group">
          <label for="franjaId">Franja Horaria</label>
          <select id="franjaId" formControlName="franjaId">
            <option value="">Seleccione una franja</option>
            <option *ngFor="let f of franjas()" [value]="f.id">{{ f.sucursal }} - {{ f.hora_inicio }}</option>
          </select>
          <div class="error" *ngIf="reservaForm.get('franjaId')?.errors?.['disponibilidad']">
            No hay disponibilidad para esta franja y fecha.
          </div>
        </div>

        <div class="form-group">
          <label for="capacidad">Capacidad (Sillas)</label>
          <input id="capacidad" type="number" formControlName="capacidad" min="1">
        </div>

        <button type="submit" [disabled]="reservaForm.invalid || loading()">
          {{ loading() ? 'Cargando...' : 'Reservar' }}
        </button>

        <div *ngIf="error()" class="alert alert-danger" role="alert">
          {{ error() }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container { max-width: 500px; margin: 2rem auto; padding: 1rem; border: 1px solid #ccc; border-radius: 8px; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    input, select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
    .error { color: red; font-size: 0.8rem; margin-top: 0.25rem; }
    button { padding: 0.75rem 1.5rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background-color: #ccc; }
  `]
})
export class ReservaFormComponent {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);

  loading = this.reservaService.loading;
  error = this.reservaService.error;
  franjas = signal<any[]>([]);

  reservaForm = this.fb.group({
    clienteId: ['c4f452f4-3b6b-4e8b-9e3b-5e4f5e4f5e4f', Validators.required],
    fecha: ['', Validators.required],
    franjaId: ['', Validators.required, [this.disponibilidadValidator.bind(this)]],
    capacidad: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    // Mock load franjas
    this.franjas.set([
      { id: 'f1', sucursal: 'Norte', hora_inicio: '18:00' },
      { id: 'f2', sucursal: 'Sur', hora_inicio: '20:00' }
    ]);
  }

  disponibilidadValidator(control: AbstractControl) {
    const fecha = this.reservaForm?.get('fecha')?.value;
    if (!control.value || !fecha) return of(null);

    return of(control.value).pipe(
      debounceTime(500),
      switchMap(franjaId => this.reservaService.checkDisponibilidad(franjaId, fecha)),
      map(res => (res.disponible ? null : { disponibilidad: true })),
      catchError(() => of(null)),
      take(1)
    );
  }

  onSubmit() {
    if (this.reservaForm.valid) {
      const idempotencyKey = crypto.randomUUID();
      this.reservaService.createReserva(this.reservaForm.value as any, idempotencyKey).subscribe({
        next: (res) => alert('Reserva creada con éxito!'),
        error: (err) => console.error(err)
      });
    }
  }
}
