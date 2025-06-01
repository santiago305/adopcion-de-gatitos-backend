import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personality } from 'src/personality/entities/personality.entity';
import { CharacteristicsService } from './characteristics.service';
import { CharacteristicsController } from './characteristics.controller';
import { Characteristics } from './entities/characteristic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Characteristics, Personality])],
  controllers: [CharacteristicsController],
  providers: [CharacteristicsService],
  exports: [CharacteristicsService],
})
export class CharacteristicsModule {}
