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
import { ErrorResponse, isTypeResponse } from 'src/common/guards/guard';
import { successResponse } from 'src/common/utils/response';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

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
  ):Promise<{ access_token: string } | ErrorResponse> {
    const result = await this.authService.login(dto);

    if (isTypeResponse(result)) return result;
    

    const { access_token, refresh_token } = result;


  
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,      
      secure: false,       
      sameSite: 'lax',     
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    // Configuración de la cookie para el access token
    res.cookie('access_token', access_token, {
      httpOnly: true,      
      secure: false,       
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60,
    });

    return { access_token } ;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token'); // Elimina la cookie de refresh token
    res.clearCookie('access_token');  // Elimina la cookie de access token
    return successResponse("Sesión cerrada correctamente");
  }


  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  refresh(@UserDecorator() user: { userId: string }) {
    return this.authService.refreshFromPayload(user);
  }
}
