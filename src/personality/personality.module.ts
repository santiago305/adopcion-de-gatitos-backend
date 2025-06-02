import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';import { TypeOrmModule } from '@nestjs/typeorm';
import { Personality } from './entities/personality.entity';
import { PersonalityService } from './personality.service';
import { PersonalityController } from './personality.controller';

@Module({
  imports: [
     TypeOrmModule.forFeature([Personality]),
    forwardRef(() => UsersModule) 
  ],
  controllers: [PersonalityController],
  providers: [PersonalityService],
  exports: [PersonalityService],
})
export class PersonalityModule {}
