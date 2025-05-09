import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { LoginAuthDto } from './dto';
import { envs } from 'src/config/envs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { RoleType } from 'src/common/constants';
import { ErrorResponse } from 'src/common/interfaces/response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Valida al usuario por email y password
  async validateUser(email: string, password: string): Promise<{ id: string }> {
    const user = await this.usersService.findWithPasswordByEmail(email);

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    return { id: user.id };
  }

  // Inicia sesión y genera tokens
  async login(dto: LoginAuthDto): Promise<{ access_token: string; refresh_token: string } | ErrorResponse> {
    const user = await this.validateUser(dto.email, dto.password);

    const payload = { sub: user.id };

    // Generación de access token y refresh token
    const access_token = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.expiresIn,
      issuer: envs.jwt.issuer,
    });

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.refreshExpiresIn,
      issuer: envs.jwt.issuer,
    });

    return { access_token, refresh_token };
  }

  // Registro de un nuevo usuario
  async register(dto: CreateUserDto): Promise<{ access_token: string; refresh_token: string } | ErrorResponse> {
    await this.usersService.create(dto, RoleType.USER);

    return this.login(dto);
  }

  // Refresca el access token utilizando el refresh token
  async refreshFromPayload(user: { userId: string }) {
    const payload = { sub: user.userId };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.expiresIn,
      issuer: envs.jwt.issuer,
    });

    return { access_token: newAccessToken };
  }

  // Función para verificar si el token es válido
  async validateAccessToken(access_token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verify(access_token, {
        secret: envs.jwt.secret,
        issuer: envs.jwt.issuer,
      });
      return !!decoded; 
    } catch (error) {
      console.error('[AuthService][validateAccessToken] error al comporbar el jwt: ',error)
      return false; 
    }
  }
}
