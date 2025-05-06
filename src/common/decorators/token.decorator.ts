import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

/**
 * Decorador personalizado para acceder al token almacenado en `req.token`.
 *
 * Este token debe haber sido previamente extraído por un middleware, como `TokenMiddleware`.
 *
 * @throws InternalServerErrorException si no se encuentra el token en la request.
 *
 * @example
 * ```ts
 * @Get('me')
 * getProfile(@Token() token: string) {
 *   console.log(token); // Accede directamente al JWT
 * }
 * ```
 */
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.token) {
      throw new InternalServerErrorException(
        'Token not found in request (AuthGuard called?)'
      );
    }

    return request.token;
  },
);
