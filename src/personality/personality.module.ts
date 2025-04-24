import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalityService } from './personality.service';
import { PersonalityController } from './personality.controller';
import { Personality } from './entities/personality.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personality])],
  controllers: [PersonalityController],
  providers: [PersonalityService],
  exports: [PersonalityService],
})
export class PersonalityModule {}