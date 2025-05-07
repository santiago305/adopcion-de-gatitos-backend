import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { UsersModule } from 'src/users/users.module';

/**
 * Módulo que gestiona todo lo relacionado con los roles de usuario.
 *
 * Este módulo incluye:
 * - La entidad `Role`.
 * - El controlador `RolesController` que expone endpoints HTTP.
 * - El servicio `RolesService` que contiene la lógica de negocio.
 *
 * @remarks
 * Usa `TypeOrmModule.forFeature` para registrar la entidad `Role` en el contexto de este módulo.
 * Exporta el servicio para que pueda ser reutilizado en otros módulos (como `UsersModule`).
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [RolesModule],
 * })
 * export class UsersModule {}
 * ```
 */
@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // Permite usar el servicio en otros módulos
})
export class RolesModule {}
