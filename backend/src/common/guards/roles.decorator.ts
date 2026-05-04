import { SetMetadata } from '@nestjs/common';
import { TipoUsuario } from '../../modules/usuarios/usuario.entity';

export const Roles = (...roles: TipoUsuario[]) => SetMetadata('roles', roles);
