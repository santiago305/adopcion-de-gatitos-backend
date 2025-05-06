import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';

/**
 * Módulo para gestionar la funcionalidad relacionada con los clientes.
 * 
 * Este módulo incluye el servicio y el controlador que permiten la creación, actualización, eliminación
 * y consulta de clientes, así como la integración con las entidades Client, EconomicStatus y User.
 */
@Module({
  imports: [
    /**
     * Importa el módulo de TypeORM para trabajar con las entidades Client, EconomicStatus y User.
     * 
     * @see TypeOrmModule.forFeature([Client, EconomicStatus, User])
     * 
     * @returns {TypeOrmModule} El módulo configurado con las entidades.
     */
    TypeOrmModule.forFeature([Client, User]),
  ],
  controllers: [
    /**
     * Controlador que maneja las solicitudes HTTP relacionadas con los clientes.
     * 
     * @see ClientsController
     */
    ClientsController,
  ],
  providers: [
    /**
     * Servicio que contiene la lógica de negocio para manejar la información de los clientes.
     * 
     * @see ClientsService
     */
    ClientsService,
  ],
  exports: [
    /**
     * Expone el servicio ClientsService para que pueda ser utilizado en otros módulos.
     * 
     * @see ClientsService
     */
    ClientsService,
  ],
})
export class ClientsModule {}
