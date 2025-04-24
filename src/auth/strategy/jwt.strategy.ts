// auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from '../../config/envs';

/**
 * Estrategia JWT para validar el access token.
 *
 * Se encarga de extraer el token del header `Authorization: Bearer <token>`
 * y verificar su validez usando la clave secreta configurada.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      /**
       * Extrae el JWT del header Authorization.
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * No se ignora la expiración del token.
       * Passport lanza un error si el token ha expirado.
       */
      ignoreExpiration: false,

      /**
       * Clave secreta usada para verificar la firma del token.
       */
      secretOrKey: envs.jwt.secret,

      /**
       * Verifica que el token provenga del issuer esperado.
       */
      issuer: envs.jwt.issuer,
    });
  }

  /**
   * Callback ejecutado si el token es válido.
   * Se usa para extraer y retornar información útil del payload.
   *
   * @param payload - Información decodificada del JWT.
   * @returns Objeto con los datos del usuario autenticado.
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
