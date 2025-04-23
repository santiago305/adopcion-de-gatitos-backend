import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor que registra el tiempo de ejecución de las solicitudes HTTP.
 *
 * Este interceptor mide cuánto tarda una solicitud en procesarse
 * y lo muestra en consola en formato:
 * `[METHOD] /ruta - Xms`
 *
 * Es útil para debugging y monitoreo de rendimiento.
 *
 * @example
 * ```ts
 * @UseInterceptors(LoggingInterceptor)
 * @Get('datos')
 * getData() {
 *   return this.dataService.getAll();
 * }
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Método que intercepta la solicitud y mide el tiempo de respuesta.
   *
   * @param context - Contexto de ejecución que contiene detalles de la solicitud.
   * @param next - Handler que continúa el flujo de ejecución del request.
   * @returns Un observable que ejecuta `tap()` para loguear el tiempo de ejecución.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() =>
        console.log(
          `[${method}] ${url} - ${Date.now() - now}ms`,
        ),
      ),
    );
  }
}
