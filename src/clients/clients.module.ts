import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

/**
 * Módulo para gestionar la funcionalidad relacionada con los clientes.
 * 
 * Este módulo incluye el servicio y el controlador que permiten la creación, actualización, eliminación
 * y consulta de clientes, así como la integración con las entidades Client, EconomicStatus y User.
 */
@Module({
  imports: [

    UsersModule,
    TypeOrmModule.forFeature([Client, User]),
  ],
  controllers: [
    ClientsController,
  ],
  providers: [
    ClientsService,
  ],
  exports: [
    ClientsService,
  ],
})
export class ClientsModule {}
