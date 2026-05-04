import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FranjaHoraria } from './franja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FranjaHoraria])],
  exports: [TypeOrmModule],
})
export class FranjasModule {}
