import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envs } from './envs';

/**
 * Módulo de configuración de la aplicación.
 *
 * Este módulo carga las variables de entorno definidas en `envs` y las expone globalmente
 * mediante el `ConfigModule` de NestJS. Esto permite acceder a la configuración
 * en cualquier parte de la aplicación sin necesidad de importar el módulo manualmente.
 *
 * @remarks
 * - `isGlobal: true` hace que el `ConfigModule` esté disponible en toda la aplicación.
 * - `load: [() => envs]` permite cargar una configuración personalizada desde un archivo.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class SomeService {
 *   constructor(@Inject(ConfigService) private config: ConfigService) {
 *     const dbHost = this.config.get('DATABASE_HOST');
 *   }
 * }
 * ```
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => envs],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
