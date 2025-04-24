import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpeciesController } from './species.controller';
import { SpeciesService } from './species.service';
import { Species } from './entities/species.entity';

/**
 * Módulo que gestiona todo lo relacionado con las especies.
 *
 * Este módulo incluye:
 * - La entidad `Species`.
 * - El controlador `SpeciesController` que expone endpoints HTTP.
 * - El servicio `SpeciesService` que contiene la lógica de negocio.
 *
 * @remarks
 * Usa `TypeOrmModule.forFeature` para registrar la entidad `Species` en el contexto de este módulo.
 * Exporta el servicio para que pueda ser reutilizado en otros módulos si es necesario.
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [SpeciesModule],
 * })
 * export class AnimalsModule {}
 * ```
 */
@Module({
  imports: [TypeOrmModule.forFeature([Species])],
  controllers: [SpeciesController],
  providers: [SpeciesService],
  exports: [SpeciesService], // Exporta el servicio si otros módulos lo necesitan
})
export class SpeciesModule {}
