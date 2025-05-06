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
 * Este controlador maneja la lógica para iniciar sesión, cerrar sesión y generar
 * nuevos tokens de acceso utilizando JWT y cookies HTTP-only. Las cookies se
 * establecen para almacenar los tokens de acceso y refresh.
 * 
 * Ruta base: `/auth`
 * 
 * @controller
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Inicia sesión con credenciales de usuario y establece un refresh token en cookie.
   * 
   * Este endpoint permite a los usuarios autenticarse usando sus credenciales (email y contraseña).
   * Si la autenticación es exitosa, se genera un token de acceso (access token) y un token de refresco (refresh token),
   * y estos tokens se almacenan en cookies HTTP-only para protegerlos contra XSS.
   * 
   * @param {LoginAuthDto} dto - DTO que contiene las credenciales de inicio de sesión (email y contraseña).
   * @param {Response} res - Objeto de respuesta (Express) utilizado para establecer las cookies con los tokens.
   * @returns {Object} Un objeto que contiene el access token y los datos del usuario autenticado.
   * 
   * @route POST /auth/login
   * 
   * @example
   * // Inicia sesión con las credenciales del usuario
   * const result = await authController.login(loginAuthDto, res);
   * 
   * @throws UnauthorizedException Si las credenciales no son válidas.
   */
  @Post('login')
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, user } =
      await this.authService.login(dto);

    // Configuración de la cookie para el refresh token
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,      // Protege contra ataques XSS
      secure: false,       // Cambiar a true en producción con HTTPS
      sameSite: 'lax',     // Previene ataques CSRF en la mayoría de los casos
      maxAge: 7 * 24 * 60 * 60 * 1000, // La cookie dura 7 días
    });

    // Configuración de la cookie para el access token
    res.cookie('access_token', access_token, {
      httpOnly: true,      // Sólo el backend puede acceder a esta cookie
      secure: false,       // Establecer como true solo si se usa HTTPS en producción
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // La cookie dura 1 hora
    });

    return { access_token, user };
  }

  /**
   * Cierra sesión eliminando las cookies de refresh token y access token.
   * 
   * Este endpoint permite a los usuarios cerrar sesión eliminando las cookies que contienen
   * los tokens de acceso y refresh.
   * 
   * @param {Response} res - Objeto de respuesta (Express) utilizado para limpiar las cookies.
   * @returns {Object} Un mensaje de éxito confirmando el cierre de sesión.
   * 
   * @route POST /auth/logout
   * 
   * @example
   * // Cierra la sesión del usuario y elimina las cookies de tokens
   * const result = await authController.logout(res);
   */
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token'); // Elimina la cookie de refresh token
    res.clearCookie('access_token');  // Elimina la cookie de access token
    return { message: 'Sesión cerrada correctamente' };
  }

  /**
   * Genera un nuevo access token a partir del refresh token.
   * 
   * Este endpoint permite al usuario obtener un nuevo access token usando su refresh token.
   * Requiere un guardia de protección (`JwtRefreshAuthGuard`) que valida el refresh token,
   * y se utiliza para actualizar el token de acceso sin necesidad de que el usuario vuelva a autenticarse.
   * 
   * @param {any} user - El usuario extraído del refresh token mediante el decorador `@UserDecorator`.
   * @returns {Object} Un nuevo access token para el usuario autenticado.
   * 
   * @route GET /auth/refresh
   * 
   * @example
   * // Genera un nuevo access token utilizando el refresh token
   * const result = await authController.refresh(user);
   * 
   * @throws UnauthorizedException Si el refresh token es inválido o ha expirado.
   */
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  refresh(@UserDecorator() user: any) {
    return this.authService.refreshFromPayload(user);
  }
}
