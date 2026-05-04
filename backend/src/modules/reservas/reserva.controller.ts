import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Request } from 'express';

@Controller('reservas')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateReservaDto,
    @Req() req: Request,
    @Headers('X-Idempotency-Key') idempotencyKey?: string,
  ) {
    const user = req.user as any;
    return await this.reservaService.create({
      ...dto,
      tenantId: user.tenantId,
      idempotencyKey: idempotencyKey || dto.idempotencyKey,
    });
  }

  @Patch(':id/confirmar')
  async confirm(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const ip = req.ip;
    return await this.reservaService.confirm(id, user.tenantId, user.userId, ip);
  }
}
