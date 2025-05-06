import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginAuthDto } from './dto';
import { mapUser } from 'src/users/utils/user.mapper';
import { envs } from 'src/config/envs';

/**
 * Servicio responsable de la lógica de autenticación.
 *
 * Incluye validación de credenciales, generación de tokens JWT y renovación de tokens.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida un usuario a partir de su email y contraseña.
   *
   * @param email - Correo electrónico del usuario.
   * @param password - Contraseña en texto plano.
   * @returns El usuario validado si las credenciales son correctas.
   * @throws UnauthorizedException si las credenciales son inválidas o el usuario está eliminado.
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.deleted) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  /**
   * Inicia sesión con email y contraseña. Retorna tokens JWT y datos del usuario.
   *
   * @param dto - DTO con email y contraseña.
   * @returns Un objeto con access_token, refresh_token y usuario mapeado.
   */
  async login(dto: LoginAuthDto) {
    const user = await this.validateUser(dto.email, dto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.description,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.expiresIn,
      issuer: envs.jwt.issuer,
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.refreshExpiresIn,
      issuer: envs.jwt.issuer,
    });

    return {
      access_token,
      refresh_token,
      user: mapUser(user),
    };
  }

  /**
   * Renueva el token de acceso a partir del payload de un refresh token.
   *
   * @param user - Objeto con `userId`, `email` y `role` extraído del refresh token.
   * @returns Un nuevo access token.
   */
  async refreshFromPayload(user: any) {
    const payload = {
      sub: user.userId,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.expiresIn,
      issuer: envs.jwt.issuer,
    });

    return { access_token: newAccessToken };
  }
}
