import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Reserva } from '../reservas/reserva.entity';
import { ListaEspera } from '../reservas/lista-espera.entity';
import { Tenant } from '../tenants/tenant.entity';

@Entity('franjas_horarias')
@Unique(['tenant_id', 'sucursal', 'hora_inicio', 'hora_fin']) // Prevent duplicate time slots per branch
export class FranjaHoraria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ length: 100 })
  sucursal: string;

  @Column({ type: 'time' })
  hora_inicio: string;

  @Column({ type: 'time' })
  hora_fin: string;

  @Column({ type: 'int' })
  capacidad_total: number;

  @Column({ type: 'int' })
  capacidad_disponible: number;

  @OneToMany(() => Reserva, (r) => r.franja)
  reservas: Reserva[];

  @OneToMany(() => ListaEspera, (l) => l.franja)
  lista_espera: ListaEspera[];
}
