import { Injectable, BadRequestException } from '@nestjs/common';
import { PoliticaCobro } from '../../modules/tenants/tenant.entity';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { SinGarantiaStrategy } from './sin-garantia.strategy';
import { GarantiaTarjetaStrategy } from './garantia-tarjeta.strategy';

@Injectable()
export class PaymentStrategyFactory {
  constructor(
    private readonly sinGarantia: SinGarantiaStrategy,
    private readonly garantiaTarjeta: GarantiaTarjetaStrategy,
  ) {}

  getStrategy(politica: PoliticaCobro): IPaymentStrategy {
    switch (politica) {
      case PoliticaCobro.SIN_GARANTIA:
        return this.sinGarantia;
      case PoliticaCobro.GARANTIA_TARJETA:
        return this.garantiaTarjeta;
      default:
        throw new BadRequestException(`Política de cobro no soportada: ${politica}`);
    }
  }
}
