import { Module } from '@nestjs/common';
import { EconomicStatusService } from './economic_status.service';
import { EconomicStatusController } from './economic_status.controller';
import { EconomicStatus } from './entities/economic_status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([EconomicStatus])],
  controllers: [EconomicStatusController],
  providers: [EconomicStatusService],
  exports: [EconomicStatusService], 
})
export class EconomicStatusModule {}
