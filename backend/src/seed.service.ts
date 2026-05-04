import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Tenant, PoliticaCobro } from './modules/tenants/tenant.entity';
import { Usuario, TipoUsuario } from './modules/usuarios/usuario.entity';
import { FranjaHoraria } from './modules/franjas/franja.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(FranjaHoraria)
    private readonly franjaRepo: Repository<FranjaHoraria>,
  ) {}

  async onApplicationBootstrap() {
    const count = await this.tenantRepo.count();
    if (count > 0) return;

    // 1. Crear Tenant
    const tenant = this.tenantRepo.create({
      nombre: 'Restaurante Central',
      politica_cobro: PoliticaCobro.SIN_GARANTIA,
    });
    const savedTenant = await this.tenantRepo.save(tenant);

    // 2. Crear Usuarios (Gerente y Host)
    const password = await bcrypt.hash('admin123', 10);
    
    const gerente = this.usuarioRepo.create({
      nombre: 'Gerente General',
      email: 'gerente@restaurante.com',
      password,
      tipo_usuario: TipoUsuario.ADMIN,
      tenant_id: savedTenant.id,
    });

    const host = this.usuarioRepo.create({
      nombre: 'Host Principal',
      email: 'host@restaurante.com',
      password,
      tipo_usuario: TipoUsuario.HOST,
      tenant_id: savedTenant.id,
    });

    await this.usuarioRepo.save([gerente, host]);

    // 3. Crear Franja Horaria
    const franja = this.franjaRepo.create({
      tenant_id: savedTenant.id,
      sucursal: 'Sede Norte',
      hora_inicio: '18:00:00',
      hora_fin: '19:00:00',
      capacidad_total: 10,
      capacidad_disponible: 10,
    });

    await this.franjaRepo.save(franja);

    console.log('Seed completado con éxito');
  }
}
