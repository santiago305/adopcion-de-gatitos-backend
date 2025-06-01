import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Diseases } from './entities/disease.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diseases])],
  controllers: [DiseasesController],
  providers: [DiseasesService],
  exports: [DiseasesService],
})
export class DiseasesModule {}
