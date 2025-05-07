import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpErrorFilter } from './filters/http-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';


/**
 * Módulo común que configura proveedores globales como filtros e interceptores.
 *
 * Este módulo registra:
 * - `HttpErrorFilter`: Un filtro global para capturar y formatear errores HTTP.
 * - `LoggingInterceptor`: Un interceptor que mide el tiempo de ejecución de las solicitudes.
 *
 * Al registrar estos proveedores con `APP_FILTER` y `APP_INTERCEPTOR`,
 * NestJS los aplica globalmente en toda la aplicación sin necesidad de usarlos en cada controlador.
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [CommonModule],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpErrorFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [],
})
export class CommonModule {}
