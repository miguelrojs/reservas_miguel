import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, mergeMap } from 'rxjs/operators';
import { Reserva, Franja } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/reservas';

  // State using Signals
  loading = signal(false);
  error = signal<string | null>(null);

  getFranjas(): Observable<Franja[]> {
    return this.http.get<Franja[]>('http://localhost:3000/franjas').pipe(
      catchError(this.handleError)
    );
  }

  createReserva(reserva: Reserva, idempotencyKey: string): Observable<Reserva> {
    this.loading.set(true);
    this.error.set(null);

    const headers = new HttpHeaders().set('X-Idempotency-Key', idempotencyKey);

    return this.http.post<Reserva>(this.apiUrl, reserva, { headers }).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          if (error.status >= 500) {
            return timer(retryCount * 1000); // Exponential backoff simple
          }
          return throwError(() => error);
        }
      }),
      catchError((err) => {
        this.error.set(err.message || 'Error al crear la reserva');
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  checkDisponibilidad(franjaId: string, fecha: string): Observable<{ disponible: boolean }> {
    return this.http.get<{ disponible: boolean }>(`http://localhost:3000/franjas/${franjaId}/disponibilidad?fecha=${fecha}`);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
