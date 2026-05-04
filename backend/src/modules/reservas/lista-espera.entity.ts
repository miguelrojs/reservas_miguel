import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { FranjaHoraria } from '../franjas/franja.entity';
import { Tenant } from '../tenants/tenant.entity';

export enum EstadoEspera {
  EN_ESPERA = 'en_espera',
  PENDIENTE_CONFIRMACION = 'pendiente_confirmacion',
  EXPIRADO = 'expirado',
  CONVERTIDO = 'convertido',
}

@Entity('lista_espera')
export class ListaEspera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenant_id: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'fk_id_cliente' })
  fk_id_cliente: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'fk_id_cliente' })
  cliente: Usuario;

  @Column({ name: 'franja_id' })
  franja_id: string;

  @ManyToOne(() => FranjaHoraria, (f) => f.lista_espera)
  @JoinColumn({ name: 'franja_id' })
  franja: FranjaHoraria;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int' })
  capacidad: number;

  @Column({ type: 'int' })
  posicion: number;

  @Column({ type: 'enum', enum: EstadoEspera, default: EstadoEspera.EN_ESPERA })
  estado: EstadoEspera;

  @Column({ nullable: true, type: 'timestamptz' })
  expira_en: Date;

  @CreateDateColumn()
  created_at: Date;
}
