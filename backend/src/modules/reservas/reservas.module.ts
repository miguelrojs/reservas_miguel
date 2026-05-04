import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Reserva } from './reserva.entity';
import { ListaEspera } from './lista-espera.entity';
import { Auditoria } from './auditoria.entity';
import { FranjaHoraria } from '../franjas/franja.entity';
import { Tenant } from '../tenants/tenant.entity';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { AuditoriaListener } from '../../common/listeners/auditoria.listener';
import { PaymentStrategyFactory } from '../../common/strategies/payment-strategy.factory';
import { SinGarantiaStrategy } from '../../common/strategies/sin-garantia.strategy';
import { GarantiaTarjetaStrategy } from '../../common/strategies/garantia-tarjeta.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, ListaEspera, Auditoria, FranjaHoraria, Tenant]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ReservaController],
  providers: [
    ReservaService,
    AuditoriaListener,
    PaymentStrategyFactory,
    SinGarantiaStrategy,
    GarantiaTarjetaStrategy,
  ],
  exports: [ReservaService],
})
export class ReservasModule {}
