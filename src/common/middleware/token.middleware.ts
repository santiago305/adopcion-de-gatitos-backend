import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware que extrae el token del encabezado `Authorization`
 * y lo adjunta al objeto `Request` como `req.token`.
 *
 * Este middleware no valida el token, solo lo extrae si está presente.
 * Para validación, se recomienda usar un guard o estrategia de autenticación.
 *
 * @example
 * // Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
 * // Resultado: req.token = 'eyJhbGciOiJIUzI1NiIsInR...'
 */
@Injectable()
export class TokenMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      req['token'] = token;
    }

    next();
  }
}
