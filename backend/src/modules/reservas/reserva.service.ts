import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Reserva, EstadoReserva } from './reserva.entity';
import { FranjaHoraria } from '../franjas/franja.entity';
import { ListaEspera, EstadoEspera } from './lista-espera.entity';
import { PaymentStrategyFactory } from '../../common/strategies/payment-strategy.factory';
import { ReservaConfirmadaEvent } from '../../common/events/reserva-confirmada.event';
import { Tenant } from '../tenants/tenant.entity';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepo: Repository<Reserva>,
    @InjectRepository(FranjaHoraria)
    private readonly franjaRepo: Repository<FranjaHoraria>,
    @InjectRepository(ListaEspera)
    private readonly listaEsperaRepo: Repository<ListaEspera>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentFactory: PaymentStrategyFactory,
  ) {}

  async create(data: {
    tenantId: string;
    clienteId: string;
    franjaId: string;
    fecha: string;
    capacidad: number;
    idempotencyKey?: string;
  }) {
    // 1. Check if idempotency key exists
    if (data.idempotencyKey) {
      const existing = await this.reservaRepo.findOne({
        where: { idempotency_key: data.idempotencyKey, tenant_id: data.tenantId },
      });
      if (existing) return existing;
    }

    return await this.dataSource.transaction(async (manager) => {
      // 2. Lock FranjaHoraria for the specific request (Pessimistic Write)
      const franja = await manager.findOne(FranjaHoraria, {
        where: { id: data.franjaId, tenant_id: data.tenantId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!franja) throw new NotFoundException('Franja horaria no encontrada');

      // 3. Check current occupancy for this franja and date
      const occupancy = await manager
        .createQueryBuilder(Reserva, 'reserva')
        .where('reserva.franja_id = :franjaId', { franjaId: data.franjaId })
        .andWhere('reserva.fecha = :fecha', { fecha: data.fecha })
        .andWhere('reserva.estado_reserva IN (:...estados)', {
          estados: [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA],
        })
        .select('SUM(reserva.capacidad)', 'total')
        .getRawOne();

      const totalOccupied = parseInt(occupancy.total || '0');

      if (totalOccupied + data.capacidad <= franja.capacidad_total) {
        // 4. Create Reserva
        const reserva = manager.create(Reserva, {
          tenant_id: data.tenantId,
          fk_id_cliente: data.clienteId,
          franja_id: data.franjaId,
          fecha: data.fecha,
          capacidad: data.capacidad,
          idempotency_key: data.idempotencyKey,
          estado_reserva: EstadoReserva.PENDIENTE,
        });
        return await manager.save(reserva);
      } else {
        // 5. Create ListaEspera entry
        const posicion = await manager.count(ListaEspera, {
          where: { franja_id: data.franjaId, fecha: data.fecha, tenant_id: data.tenantId },
        });

        const espera = manager.create(ListaEspera, {
          tenant_id: data.tenantId,
          fk_id_cliente: data.clienteId,
          franja_id: data.franjaId,
          fecha: data.fecha,
          capacidad: data.capacidad,
          posicion: posicion + 1,
          estado: EstadoEspera.EN_ESPERA,
        });
        await manager.save(espera);
        throw new ConflictException('Capacidad agotada. Se ha agregado a la lista de espera.');
      }
    });
  }

  async confirm(id: string, tenantId: string, usuarioId: string, ip?: string) {
    return await this.dataSource.transaction(async (manager) => {
      const reserva = await manager.findOne(Reserva, {
        where: { id, tenant_id: tenantId },
        relations: ['tenant'],
      });

      if (!reserva) throw new NotFoundException('Reserva no encontrada');
      if (reserva.estado_reserva !== EstadoReserva.PENDIENTE) {
        throw new BadRequestException('La reserva no está en estado PENDIENTE');
      }

      // Pattern Strategy: Process payment based on tenant policy
      const tenant = await manager.findOne(Tenant, { where: { id: tenantId } });
      const strategy = this.paymentFactory.getStrategy(tenant.politica_cobro);
      const paymentResult = await strategy.process(reserva);

      if (!paymentResult.success) {
        throw new BadRequestException(`Error en el pago: ${paymentResult.message}`);
      }

      reserva.estado_reserva = EstadoReserva.CONFIRMADA;
      const savedReserva = await manager.save(reserva);

      // Pattern Observer: Emit event for auditing
      this.eventEmitter.emit(
        'reserva.confirmada',
        new ReservaConfirmadaEvent(savedReserva, usuarioId, ip),
      );

      return savedReserva;
    });
  }
}
