import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
import { RoleType } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(forwardRef(() => UsersService)) // evita problemas de dependencia circular
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<RoleType[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!allowedRoles) return true; 

    const request = context.switchToHttp().getRequest();
    const { userId } = request.user;

    
    const result = await this.usersService.findOne(userId);
    if (result.type === 'error') {
      throw new ForbiddenException('No se pudo validar el usuario');
    }

    const userRole = result.data.role?.description;
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException({
        message: 'Acceso denegado: rol insuficiente',
        type: 'error',
      });
    }

    return true;
  }
}
