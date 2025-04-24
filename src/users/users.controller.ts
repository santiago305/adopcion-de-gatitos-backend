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
import { User as CurrentUser } from 'src/common/decorators/user.decorator';

/**
 * Controlador para la gestión de usuarios.
 * Maneja rutas relacionadas a operaciones CRUD sobre los usuarios.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario.
   * @param dto Datos para crear el usuario
   * @returns Usuario creado
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
   * @returns Lista de usuarios
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtiene todos los usuarios marcados como activos.
   * @returns Lista de usuarios activos
   */
  @Get('actives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findActives() {
    return this.usersService.findActives();
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id ID del usuario
   * @returns Usuario encontrado
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param email Email del usuario
   * @returns Usuario encontrado
   */
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Actualiza un usuario existente.
   * @param id ID del usuario
   * @param dto Datos a actualizar
   * @returns Usuario actualizado
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  /**
   * Elimina lógicamente un usuario por su ID.
   * @param id ID del usuario
   * @returns Usuario marcado como eliminado
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Restaura un usuario previamente eliminado.
   * @param id ID del usuario
   * @returns Usuario restaurado
   */
  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restore(+id);
  }
}
