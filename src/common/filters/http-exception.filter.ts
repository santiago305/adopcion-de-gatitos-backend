import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global para manejar excepciones HTTP en la aplicación.
 *
 * Este filtro atrapa todas las excepciones que extienden de `HttpException`
 * y retorna una respuesta estructurada con detalles como el código de estado,
 * la fecha, la URL de la petición y el mensaje de error.
 *
 * Se puede aplicar globalmente o por controlador.
 *
 * @example
 * ```ts
 * // Aplicación global
 * app.useGlobalFilters(new HttpErrorFilter());
 * ```
 */
@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  /**
   * Método que captura la excepción y construye una respuesta personalizada.
   *
   * @param exception - Instancia de la excepción lanzada (de tipo HttpException).
   * @param host - Contexto que proporciona acceso a la petición y respuesta.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}
