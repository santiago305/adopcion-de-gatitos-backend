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

  async validateUser(email: string, password: string): Promise<{ id: string }> {
    const user = await this.usersService.findWithPasswordByEmail(email);

    if (!user)throw new UnauthorizedException('Credenciales inválidas');

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid)  throw new UnauthorizedException('Credenciales inválidas');;

    return { id: user.id };
  }

  async login(dto: LoginAuthDto): Promise<{ access_token: string; refresh_token: string } | ErrorResponse> {
    const user = await this.validateUser(dto.email, dto.password);

    const payload = { sub: user.id };

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

  async register(dto: CreateUserDto): Promise<{ access_token: string; refresh_token: string } | ErrorResponse> {
    await this.usersService.create(dto, RoleType.USER);

    return this.login(dto);
  }

  async refreshFromPayload(user: { userId: string }) {
    const payload = { sub: user.userId };

    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: envs.jwt.expiresIn,
      issuer: envs.jwt.issuer,
    });

    return { access_token: newAccessToken };
  }
}
