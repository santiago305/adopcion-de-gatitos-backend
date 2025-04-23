import { Controller, Post, Get, Body, Param, Patch, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/**
 * Controlador que gestiona las rutas relacionadas con los roles.
 *
 * Proporciona endpoints para crear, listar, actualizar, eliminar y restaurar roles.
 *
 * Ruta base: `/roles`
 */
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Crea un nuevo rol.
   *
   * @param dto - Datos para crear el rol.
   * @returns El rol creado.
   * @route POST /roles
   */
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  /**
   * Obtiene todos los roles registrados.
   *
   * @returns Lista de todos los roles.
   * @route GET /roles
   */
  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  /**
   * Obtiene todos los roles activos (no eliminados).
   *
   * @returns Lista de roles activos.
   * @route GET /roles/actives
   */
  @Get('actives')
  findActives() {
    return this.rolesService.findActives();
  }

  /**
   * Obtiene un rol por su ID.
   *
   * @param id - ID del rol.
   * @returns El rol correspondiente.
   * @route GET /roles/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  /**
   * Actualiza un rol por su ID.
   *
   * @param id - ID del rol.
   * @param dto - Datos actualizados del rol.
   * @returns El rol actualizado.
   * @route PATCH /roles/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(+id, dto);
  }

  /**
   * Marca un rol como eliminado (soft delete).
   *
   * @param id - ID del rol.
   * @returns El rol con estado `deleted` en true.
   * @route DELETE /roles/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }

  /**
   * Restaura un rol previamente eliminado.
   *
   * @param id - ID del rol.
   * @returns El rol restaurado.
   * @route PATCH /roles/:id/restore
   */
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.rolesService.restore(+id);
  }
}
