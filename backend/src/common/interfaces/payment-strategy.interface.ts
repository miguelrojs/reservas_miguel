import { Reserva } from '../../modules/reservas/reserva.entity';

export interface IPaymentStrategy {
  process(reserva: Reserva): Promise<{ success: boolean; message: string }>;
}
