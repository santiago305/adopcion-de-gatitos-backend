import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacteristicsController } from './characteristics.controller';
import { CharacteristicsService } from './characteristics.service';
import { UsersModule } from 'src/users/users.module'; // 👈
import { Characteristics } from './entities/characteristic.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Characteristics]),
    forwardRef(() => UsersModule), // 👈 ESTA LÍNEA ES CLAVE
  ],
  controllers: [CharacteristicsController],
  providers: [CharacteristicsService],
  exports: [CharacteristicsService],
})
export class CharacteristicsModule {}
