import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { Reserva } from '../../modules/reservas/reserva.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SinGarantiaStrategy implements IPaymentStrategy {
  async process(reserva: Reserva): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Reserva sin garantía procesada' };
  }
}
