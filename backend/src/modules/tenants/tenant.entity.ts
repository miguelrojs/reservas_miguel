import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum PoliticaCobro {
  SIN_GARANTIA = 'sin_garantia',
  GARANTIA_TARJETA = 'garantia_tarjeta',
  DEPOSITO_PREVIO = 'deposito_previo',
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: PoliticaCobro,
    default: PoliticaCobro.SIN_GARANTIA,
  })
  politica_cobro: PoliticaCobro;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  created_at: Date;
}
