import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User as CurrentUser, User } from 'src/common/decorators/user.decorator';

/**
 * Controlador para la gestión de usuarios.
 * Este controlador gestiona las operaciones CRUD (crear, leer, actualizar, eliminar)
 * para los usuarios, y está protegido con autenticación y roles.
 * 
 * @Controller('users') 
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario.
   * 
   * @param dto Los datos necesarios para crear el usuario. (Creación de usuario)
   * @param currentUser Información del usuario autenticado (opcional, se usa para roles).
   * @returns El usuario recién creado.
   * 
   * @example
   * // Crea un nuevo usuario
   * usersController.create(createUserDto);
   */
  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser?: any 
  ) {
    return this.usersService.create(dto, currentUser?.role);
  }

  /**
   * Obtiene todos los usuarios activos (no eliminados).
   * Solo accesible por administradores.
   * 
   * @returns Lista de usuarios activos.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws ForbiddenException Si el usuario no tiene el rol adecuado.
   * 
   * @example
   * // Obtiene todos los usuarios activos
   * usersController.findAll();
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtiene todos los usuarios marcados como activos.
   * Solo accesible por administradores.
   * 
   * @returns Lista de usuarios activos.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws ForbiddenException Si el usuario no tiene el rol adecuado.
   * 
   * @example
   * // Obtiene todos los usuarios activos
   * usersController.findActives();
   */
  @Get('actives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findActives() {
    return this.usersService.findActives();
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * 
   * @param user Información del usuario autenticado.
   * @returns El usuario autenticado.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * 
   * @example
   * // Obtiene el perfil del usuario autenticado
   * usersController.getProfile(user);
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@User() user: any) {
    return this.usersService.findOne(user.userId);
  }

  /**
   * Obtiene un usuario por su ID.
   * Solo accesible por administradores.
   * 
   * @param id El ID del usuario a obtener.
   * @returns El usuario con el ID especificado.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws ForbiddenException Si el usuario no tiene el rol adecuado.
   * @throws NotFoundException Si el usuario no existe.
   * 
   * @example
   * // Obtiene un usuario con ID 1
   * usersController.findOne('1');
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /**
   * Busca un usuario por su correo electrónico.
   * 
   * @param email El correo electrónico del usuario.
   * @returns El usuario correspondiente al correo electrónico.
   * 
   * @throws NotFoundException Si el usuario no existe.
   * 
   * @example
   * // Busca un usuario por correo electrónico
   * usersController.findByEmail('test@example.com');
   */
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Actualiza un usuario existente.
   * 
   * @param id El ID del usuario a actualizar.
   * @param dto Los datos a actualizar en el usuario.
   * @returns El usuario actualizado.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws NotFoundException Si el usuario no existe.
   * 
   * @example
   * // Actualiza el usuario con ID 1
   * usersController.update('1', updateUserDto);
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  /**
   * Elimina lógicamente un usuario por su ID.
   * 
   * @param id El ID del usuario a eliminar.
   * @returns El usuario marcado como eliminado.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws NotFoundException Si el usuario no existe.
   * 
   * @example
   * // Elimina lógicamente el usuario con ID 1
   * usersController.remove('1');
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Restaura un usuario previamente eliminado.
   * Solo accesible por administradores.
   * 
   * @param id El ID del usuario a restaurar.
   * @returns El usuario restaurado.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws ForbiddenException Si el usuario no tiene el rol adecuado.
   * @throws NotFoundException Si el usuario no existe.
   * 
   * @example
   * // Restaura el usuario con ID 1
   * usersController.restore('1');
   */
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restore(+id);
  }
}
