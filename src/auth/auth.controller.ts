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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { isTypeResponse } from 'src/common/guards/guard';

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

  @Post('register')
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.register(dto);
    if (isTypeResponse(result)) {
      return result;
    }

    const { access_token, refresh_token } = result;

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false, // ✅ en producción usa true
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60, // 1 hora
    });

    return { access_token };
  }


  @Post('login')
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
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

    return { access_token } ;
  }

  


  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token'); // Elimina la cookie de refresh token
    res.clearCookie('access_token');  // Elimina la cookie de access token
    return { message: 'Sesión cerrada correctamente' };
  }


  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  refresh(@UserDecorator() user: { userId: string }) {
    return this.authService.refreshFromPayload(user);
  }
}
