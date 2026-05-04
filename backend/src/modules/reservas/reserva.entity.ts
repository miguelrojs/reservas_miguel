import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, VersionColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { FranjaHoraria } from '../franjas/franja.entity';
import { Tenant } from '../tenants/tenant.entity';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  NO_SHOW = 'no_show',
  COMPLETADA = 'completada',
}

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'fk_id_cliente' })
  fk_id_cliente: string;

  @ManyToOne(() => Usuario, (u) => u.reservas, { eager: false })
  @JoinColumn({ name: 'fk_id_cliente' })
  cliente: Usuario;

  @Column({ name: 'franja_id' })
  franja_id: string;

  @ManyToOne(() => FranjaHoraria, (f) => f.reservas, { eager: false })
  @JoinColumn({ name: 'franja_id' })
  franja: FranjaHoraria;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.PENDIENTE })
  estado_reserva: EstadoReserva;

  @Column({ type: 'int', default: 1 })
  capacidad: number;

  @Column({ nullable: true, unique: true })
  idempotency_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @VersionColumn()
  version: number;
}
