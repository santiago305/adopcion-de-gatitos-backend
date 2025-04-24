import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { User as UserDecorator } from '../common/decorators';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Response } from 'express';

/**
 * Controlador encargado de la autenticación de usuarios.
 *
 * Incluye login, logout y refresh de tokens utilizando JWT y cookies HTTP-only.
 *
 * Ruta base: `/auth`
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicia sesión con credenciales de usuario y establece un refresh token en cookie.
   *
   * @param dto - DTO con email y contraseña.
   * @param res - Objeto Response para setear cookie del refresh token.
   * @returns Access token y datos del usuario autenticado.
   * @route POST /auth/login
   */
  @Post('login')
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(dto);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,      // Protege contra XSS
      secure: false,       // Cambiar a true en producción con HTTPS
      sameSite: 'lax',     // Previene CSRF en la mayoría de los casos
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
    res.cookie('access_token', access_token, {
      httpOnly: true, // solo el backend puede acceder
      secure: false, // true solo si usás HTTPS
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1h
    });

    return { access_token, user };
  }

  /**
   * Cierra sesión eliminando la cookie de refresh token.
   *
   * @param res - Objeto Response para limpiar cookie.
   * @returns Mensaje de éxito.
   * @route POST /auth/logout
   */
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Genera un nuevo access token a partir del refresh token (requiere guard).
   *
   * @param user - Usuario extraído del refresh token mediante el decorador personalizado.
   * @returns Nuevo access token.
   * @route GET /auth/refresh
   */
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  refresh(@UserDecorator() user: any) {
    return this.authService.refreshFromPayload(user);
  }
}
