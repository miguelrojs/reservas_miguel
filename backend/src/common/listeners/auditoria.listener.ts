import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from '../modules/reservas/auditoria.entity';
import { ReservaConfirmadaEvent } from '../common/events/reserva-confirmada.event';

@Injectable()
export class AuditoriaListener {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepo: Repository<Auditoria>,
  ) {}

  @OnEvent('reserva.confirmada')
  async handleReservaConfirmada(event: ReservaConfirmadaEvent) {
    const auditoria = this.auditoriaRepo.create({
      tenant_id: event.reserva.tenant_id,
      entidad: 'reserva',
      entidad_id: event.reserva.id,
      accion: 'CONFIRMAR',
      usuario_id: event.usuarioId,
      ip: event.ip,
      cambios: { estado: 'confirmada' },
    });

    await this.auditoriaRepo.save(auditoria);
  }
}
