import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador personalizado que extrae el usuario autenticado desde la request (`req.user`).
 *
 * Requiere que un `AuthGuard` (como JWT o sesión) haya poblado `request.user`.
 *
 * @throws InternalServerErrorException si no se encuentra el usuario en la request.
 *
 * @example
 * ```ts
 * @Get('me')
 * getProfile(@User() user: any) {
 *   console.log(user); // Accede directamente al usuario autenticado
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // if (!request.user) {
    //   throw new InternalServerErrorException(
    //     'User not found in request (AuthGuard called?)'
    //   );
    // }

    return request.user || null;
  },
);
