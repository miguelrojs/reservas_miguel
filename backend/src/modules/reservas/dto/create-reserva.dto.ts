import { IsUUID, IsDateString, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreateReservaDto {
  @IsUUID()
  clienteId: string;

  @IsUUID()
  franjaId: string;

  @IsDateString()
  fecha: string;

  @IsInt()
  @Min(1)
  capacidad: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
