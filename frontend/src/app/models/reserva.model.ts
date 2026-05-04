export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
}

export interface Reserva {
  id?: string;
  clienteId: string;
  franjaId: string;
  fecha: string;
  capacidad: number;
  estado?: EstadoReserva;
}

export interface Franja {
  id: string;
  sucursal: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad_total: number;
  capacidad_disponible: number;
}
