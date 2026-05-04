import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { Reserva } from '../../modules/reservas/reserva.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GarantiaTarjetaStrategy implements IPaymentStrategy {
  async process(reserva: Reserva): Promise<{ success: boolean; message: string }> {
    // MOCK: Simulación de procesamiento de tarjeta
    console.log(`Procesando garantía de tarjeta para reserva ${reserva.id}`);
    return { success: true, message: 'Garantía de tarjeta procesada (MOCK)' };
  }
}
