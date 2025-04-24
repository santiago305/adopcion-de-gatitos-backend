import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /**
   * Obtiene todos los usuarios activos (no eliminados).
   * @returns Lista de usuarios
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * Obtiene todos los usuarios marcados como activos.
   * @returns Lista de usuarios activos
   */
  @Get('actives')
  findActives() {
    return this.usersService.findActives();
  }

  /**
   * Obtiene un usuario por su ID.
   * @param id ID del usuario
   * @returns Usuario encontrado
   */
  @Get(':id')
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
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(+id, dto);
  }

  /**
   * Elimina lógicamente un usuario por su ID.
   * @param id ID del usuario
   * @returns Usuario marcado como eliminado
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  /**
   * Restaura un usuario previamente eliminado.
   * @param id ID del usuario
   * @returns Usuario restaurado
   */
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.usersService.restore(+id);
  }
}
