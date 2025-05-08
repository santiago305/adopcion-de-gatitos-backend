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
import { RoleType, status } from '../constants';

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
    if (result.type === status.ERROR) {
      throw new ForbiddenException('No se pudo validar el usuario');
    }

    const userRole = result.data.rol;
    if (!Object.values(RoleType).includes(userRole as RoleType)) {
      throw new ForbiddenException('Rol no válido');
    }
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Acceso denegado: rol insuficiente');
    }

    return true;
  }
}
