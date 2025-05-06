import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from '../../config/envs';
import { Request } from 'express';

/**
 * Estrategia para la validación de JWT.
 * Extiende PassportStrategy para utilizar JWT como método de autenticación.
 * La estrategia busca el token en las cookies y lo valida usando la clave secreta proporcionada.
 * 
 * @class JwtStrategy
 * @extends PassportStrategy(Strategy)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  
  /**
   * Constructor de la estrategia JWT.
   * Configura las opciones necesarias para la validación del JWT.
   * 
   * @constructor
   */
  constructor() {
    super({
      /**
       * Extrae el JWT de las cookies de la solicitud.
       * Utiliza `req.cookies.access_token` como fuente del token.
       * 
       * @function
       * @param {Request} req La solicitud Express que contiene las cookies.
       * @returns {string} El token JWT extraído de las cookies.
       */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token, // 👈 lee desde cookie
      ]),
      ignoreExpiration: false, // No ignora la expiración del token.
      secretOrKey: envs.jwt.secret, // Clave secreta para verificar el JWT.
      issuer: envs.jwt.issuer, // Emisor del JWT (verificado en el token).
    });
  }

  /**
   * Valida el payload del JWT.
   * Extrae la información del usuario (ID, correo electrónico, rol) desde el payload.
   * 
   * @param {any} payload El payload decodificado del JWT.
   * @returns {object} Un objeto con el `userId`, `email` y `role` extraídos del payload.
   * 
   * @throws {UnauthorizedException} Si el JWT es inválido o expirado.
   * 
   * @example
   * // Valida el payload del JWT y extrae la información del usuario
   * const user = await jwtStrategy.validate(payload);
   */
  async validate(payload: any) {
    // Extrae la información del usuario del JWT (por ejemplo, sub: userId, email, role)
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
