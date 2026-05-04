import { Reserva } from '../modules/reservas/reserva.entity';

export class ReservaConfirmadaEvent {
  constructor(
    public readonly reserva: Reserva,
    public readonly usuarioId: string,
    public readonly ip?: string,
  ) {}
}
