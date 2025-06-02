import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Diseases } from './entities/disease.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diseases]),
    forwardRef(() => UsersModule)
  ],
  controllers: [DiseasesController],
  providers: [DiseasesService],
  exports: [DiseasesService],
})
export class DiseasesModule {}
