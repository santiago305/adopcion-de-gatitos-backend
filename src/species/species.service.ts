import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Species } from './entities/species.entity';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

/**
 * Servicio encargado de la gestión de especies.
 *
 * Incluye operaciones CRUD, además de métodos para restaurar o marcar una especie como eliminada (soft delete).
 */
@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(Species)
    private readonly speciesRepository: Repository<Species>,
  ) {}

  /**
   * Crea una nueva especie.
   *
   * @param dto - Datos necesarios para crear la especie.
   * @returns La especie recién creada.
   */
  async create(dto: CreateSpeciesDto) {
    const species = this.speciesRepository.create(dto);
    return this.speciesRepository.save(species);
  }

  /**
   * Obtiene todas las especies registradas.
   *
   * @returns Lista completa de especies.
   */
  async findAll() {
    return this.speciesRepository.find();
  }

  /**
   * Obtiene todas las especies activas (que no han sido marcadas como eliminadas).
   *
   * @returns Lista de especies activas.
   */
  async findActives() {
    return this.speciesRepository.find({
      where: { deleted: false },
    });
  }

  /**
   * Busca una especie por su ID.
   *
   * @param id - ID de la especie.
   * @returns La especie encontrada.
   * @throws NotFoundException si la especie no existe.
   */
  async findOne(id: number) {
    const species = await this.speciesRepository.findOneBy({ id });
    if (!species) {
      throw new NotFoundException(`La especie con id ${id} no ha sido encontrada`);
    }
    return species;
  }

  /**
   * Actualiza una especie existente.
   *
   * @param id - ID de la especie.
   * @param dto - Datos actualizados.
   * @returns La especie actualizada.
   */
  async update(id: number, dto: UpdateSpeciesDto) {
    await this.findOne(id); // Valida existencia
    await this.speciesRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Marca una especie como eliminada (soft delete).
   *
   * @param id - ID de la especie.
   * @returns La especie actualizada con `deleted` en true.
   */
  async remove(id: number) {
    const species = await this.findOne(id);
    species.deleted = true;
    return this.speciesRepository.save(species);
  }

  /**
   * Restaura una especie previamente eliminada.
   *
   * @param id - ID de la especie.
   * @returns La especie restaurada.
   */
  async restore(id: number) {
    const species = await this.findOne(id);
    species.deleted = false;
    return this.speciesRepository.save(species);
  }
}
