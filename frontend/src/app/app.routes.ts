import { Routes } from '@angular/router';
import { ReservaFormComponent } from './components/reserva-form.component';

export const routes: Routes = [
  { path: 'reservar', component: ReservaFormComponent },
  { path: '', redirectTo: 'reservar', pathMatch: 'full' }
];
