// auth/jwt-refresh-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que asegura que el request contiene un JWT de refresco válido.
 *
 * Este guard extiende la estrategia `jwt-refresh` definida en `JwtRefreshStrategy`.
 * Se utiliza para proteger las rutas que requieren un refresh token válido.
 */
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {}
