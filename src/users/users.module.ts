import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

/**
 * Módulo encargado de la gestión de usuarios.
 * Incluye el controlador, servicio y entidad User.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])], // Importa la entidad User para operaciones con TypeORM
  controllers: [UsersController], // Controlador REST para endpoints relacionados con usuarios
  providers: [UsersService], // Servicio con la lógica de negocio para usuarios
  exports: [UsersService], // Exporta el servicio para que pueda ser usado en otros módulos
})
export class UsersModule {}
