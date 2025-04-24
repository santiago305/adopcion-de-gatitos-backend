import { Controller, Post, Get, Body, Param, Patch, Delete } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { CreatePersonalityDto } from './dto/create-personality.dto';
import { UpdatePersonalityDto } from './dto/update-personality.dto';

/**
 * Controlador encargado de gestionar las rutas relacionadas con las personalidades.
 *
 * Ruta base: `/personality`
 */
@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  /**
   * Crea una nueva personalidad.
   *
   * @param dto - Datos para crear la personalidad.
   * @returns La personalidad creada.
   * @route POST /personality
   */
  @Post()
  create(@Body() dto: CreatePersonalityDto) {
    return this.personalityService.create(dto);
  }

  /**
   * Obtiene todas las personalidades registradas.
   *
   * @returns Lista de todas las personalidades.
   * @route GET /personality
   */
  @Get()
  findAll() {
    return this.personalityService.findAll();
  }

  /**
   * Obtiene todas las personalidades activas (no eliminadas).
   *
   * @returns Lista de personalidades activas.
   * @route GET /personality/actives
   */
  @Get('actives')
  findActives() {
    return this.personalityService.findActives();
  }

  /**
   * Obtiene una personalidad por su ID.
   *
   * @param id - ID de la personalidad.
   * @returns La personalidad correspondiente.
   * @route GET /personality/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personalityService.findOne(+id);
  }

  /**
   * Actualiza una personalidad por su ID.
   *
   * @param id - ID de la personalidad.
   * @param dto - Datos actualizados de la personalidad.
   * @returns La personalidad actualizada.
   * @route PATCH /personality/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonalityDto) {
    return this.personalityService.update(+id, dto);
  }

  /**
   * Marca una personalidad como eliminada (soft delete).
   *
   * @param id - ID de la personalidad.
   * @returns La personalidad con estado `deleted` en true.
   * @route DELETE /personality/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
  return this.personalityService.remove(+id);
  }

  /**
   * Restaura una personalidad previamente eliminada.
   *
   * @param id - ID de la personalidad.
   * @returns La personalidad restaurada.
   * @route PATCH /personality/:id/restore
   */
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.personalityService.restore(+id);
  }
}