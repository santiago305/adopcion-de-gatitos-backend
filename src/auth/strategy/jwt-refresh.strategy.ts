import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { envs } from '../../config/envs';

/**
 * Estrategia Passport para validar el refresh token desde una cookie.
 *
 * Esta estrategia se registra bajo el nombre `'jwt-refresh'`.
 * Se encarga de extraer el token desde la cookie `refresh_token`
 * y validar su firma y contenido.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      /**
       * Extrae el JWT desde la cookie 'refresh_token'.
       * Esta es una práctica más segura que enviarlo por header.
       */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies['refresh_token'], 
      ]),

      /**
       * Clave secreta usada para verificar la firma del token.
       */
      secretOrKey: envs.jwt.secret,

      /**
       * No se ignora la expiración, se validará automáticamente.
       */
      ignoreExpiration: false,

      /**
       * Verifica el `issuer` del token para mayor seguridad.
       */
      issuer: envs.jwt.issuer,

      /**
       * No se pasa la request completa al callback de validación.
       */
      passReqToCallback: false,
    });
  }

  /**
   * Método que se ejecuta si el token es válido.
   * Retorna un objeto con los datos del usuario extraídos del payload.
   *
   * @param payload - Cuerpo del token decodificado.
   * @returns Objeto con datos del usuario autenticado.
   */
  async validate(payload: any) {
    return {
      userId: payload.sub,
    };
  }
}
