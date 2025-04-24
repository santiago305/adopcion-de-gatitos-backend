import { Controller, Post, Get, Body, Param, Patch, Delete } from '@nestjs/common';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

/**
 * Controlador encargado de gestionar las rutas relacionadas con las especies.
 *
 * Ruta base: `/species`
 */
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  /**
   * Crea una nueva especie.
   *
   * @param dto - Datos para crear la especie.
   * @returns La especie creada.
   * @route POST /species
   */
  @Post()
  create(@Body() dto: CreateSpeciesDto) {
    return this.speciesService.create(dto);
  }

  /**
   * Obtiene todas las especies registradas (incluye eliminadas).
   *
   * @returns Lista de todas las especies.
   * @route GET /species
   */
  @Get()
  findAll() {
    return this.speciesService.findAll();
  }

  /**
   * Obtiene todas las especies activas (no eliminadas).
   *
   * @returns Lista de especies activas.
   * @route GET /species/actives
   */
  @Get('actives')
  findActives() {
    return this.speciesService.findActives();
  }

  /**
   * Obtiene una especie por su ID.
   *
   * @param id - ID de la especie.
   * @returns La especie correspondiente.
   * @route GET /species/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(+id);
  }

  /**
   * Actualiza una especie por su ID.
   *
   * @param id - ID de la especie.
   * @param dto - Datos actualizados de la especie.
   * @returns La especie actualizada.
   * @route PATCH /species/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSpeciesDto) {
    return this.speciesService.update(+id, dto);
  }

  /**
   * Marca una especie como eliminada (soft delete).
   *
   * @param id - ID de la especie.
   * @returns La especie con `deleted` en true.
   * @route DELETE /species/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speciesService.remove(+id);
  }

  /**
   * Restaura una especie previamente eliminada.
   *
   * @param id - ID de la especie.
   * @returns La especie restaurada.
   * @route PATCH /species/:id/restore
   */
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.speciesService.restore(+id);
  }
}

