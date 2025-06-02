import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Species } from 'src/species/entities/species.entity';
import { Breed } from 'src/breed/entities/breed.entity';
import { AnimalsService } from './animals.service';
import { AnimalsController } from './animals.controller';
import { Animals } from './entities/animal.entity';
import { Diseases } from 'src/diseases/entities/disease.entity';
import { Characteristics } from 'src/characteristics/entities/characteristic.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Animals, Species, Breed, Diseases, Characteristics]),
    forwardRef(() => UsersModule)
  ],
  controllers: [AnimalsController],
  providers: [AnimalsService],
  exports: [AnimalsService],
})
export class AnimalsModule {}
