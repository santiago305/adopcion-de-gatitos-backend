import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard para controlar el acceso basado en roles.
 *
 * Este guard se encarga de verificar si el usuario autenticado tiene
 * el rol necesario para acceder a una ruta protegida.
 *
 * Los roles permitidos deben definirse como metadatos usando el decorador `@SetMetadata('roles', ['admin', 'user'])`.
 *
 * @example
 * ```ts
 * @SetMetadata('roles', ['admin'])
 * @UseGuards(RolesGuard)
 * @Get('admin')
 * getAdminData() {
 *   return 'Solo para admins';
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /**
   * Constructor que inyecta el reflector para acceder a los metadatos.
   *
   * @param reflector - Instancia de Reflector para leer metadatos definidos con `@SetMetadata`.
   */
  constructor(private reflector: Reflector) {}

  /**
   * Método que determina si el usuario puede acceder al recurso.
   *
   * @param context - Contexto de ejecución actual.
   * @returns `true` si el usuario tiene acceso; lanza una excepción si no lo tiene.
   * @throws {ForbiddenException} Si el usuario no tiene un rol permitido.
   */
  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos, se permite el acceso por defecto
    if (!allowedRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si no hay usuario o su rol no está permitido, se deniega el acceso
    if (!user || !allowedRoles.includes(user.role)) {
      throw new ForbiddenException({
        message: 'Acceso denegado: rol insuficiente',
        type: 'error'
      });
      
    }

    // Acceso permitido
    return true;
  }
}
