import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Breed } from './entities/breed.entity';
import { Species } from 'src/species/entities/species.entity';
import { BreedService } from './breed.service';
import { BreedController } from './breed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Breed, Species])],
  controllers: [BreedController],
  providers: [BreedService],
  exports: [BreedService],
})
export class BreedModule {}
