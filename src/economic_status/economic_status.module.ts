import { Module } from '@nestjs/common';
import { EconomicStatusService } from './economic_status.service';
import { EconomicStatusController } from './economic_status.controller';
import { EconomicStatus } from './entities/economic_status.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Módulo encargado de gestionar los estados económicos de la aplicación.
 * 
 * Este módulo agrupa los servicios, controladores y entidades relacionados con 
 * los estados económicos, proporcionando funcionalidades CRUD, recuperación de 
 * estados activos, y restauración de estados eliminados lógicamente.
 * 
 * @module
 */
@Module({
  imports: [
    /**
     * Importa el módulo de TypeORM para interactuar con la entidad `EconomicStatus`.
     * Esta configuración permite realizar operaciones sobre la tabla `economic_status` 
     * en la base de datos.
     * 
     * @module TypeOrmModule
     */
    TypeOrmModule.forFeature([EconomicStatus]),
  ],
  controllers: [
    /**
     * Controlador que gestiona las solicitudes HTTP relacionadas con los estados económicos.
     * Permite crear, actualizar, eliminar, restaurar y obtener estados económicos.
     * 
     * @controller EconomicStatusController
     */
    EconomicStatusController,
  ],
  providers: [
    /**
     * Servicio que contiene la lógica de negocio relacionada con los estados económicos.
     * Proporciona los métodos para interactuar con la base de datos y realizar las operaciones
     * necesarias sobre los estados económicos.
     * 
     * @service EconomicStatusService
     */
    EconomicStatusService,
  ],
  exports: [
    /**
     * Expone el `EconomicStatusService` para que pueda ser utilizado en otros módulos.
     * 
     * @service EconomicStatusService
     */
    EconomicStatusService,
  ],
})
export class EconomicStatusModule {}
