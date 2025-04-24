import { Injectable } from '@nestjs/common';
import { CreatePersonalityDto } from './dto/create-personality.dto';
import { UpdatePersonalityDto } from './dto/update-personality.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personality } from './entities/personality.entity';

/**
 * Servicio encargado de la gestión de personalidades en el sistema.
 *
 * Incluye operaciones CRUD, además de métodos para restaurar o marcar una personalidad como eliminada (soft delete).
 */
@Injectable()
export class PersonalityService {
  constructor(
    @InjectRepository(Personality)
    private readonly personalityRepository: Repository<Personality>,
  ) {}

  /**
   * Crea una nueva personalidad en la base de datos.
   * 
   * @param dto - Datos necesarios para crear una nueva personalidad.
   * @returns La personalidad recién creada y guardada.
   */
  async create(dto: CreatePersonalityDto) {
    const personality = this.personalityRepository.create(dto);
    return this.personalityRepository.save(personality);
  }

  /**
   * Obtiene todas las personalidades registradas.
   * 
   * @returns Lista completa de personalidades.
   */
  async findAll() {
    return this.personalityRepository.find();
  }

  /**
   * Obtiene todas las personalidades que no están marcadas como eliminadas.
   *
   * @returns Lista de personalidades activas.
   */
  async findActives() {
    return this.personalityRepository.find({
      where: { deleted: false },
    });
  }

  /**
   * Busca una personalidad por su ID.
   *
   * @param id - Identificador único de la personalidad.
   * @throws Error si la personalidad no existe.
   * @returns La personalidad encontrada.
   */
  async findOne(id: number) {
    const personality = await this.personalityRepository.findOneBy({ id });
    if (!personality) throw new Error(`La personalidad ${id} no ha sido encontrada`);
    return personality;
  }

  /**
   * Actualiza una personalidad existente por ID.
   *
   * @param id - ID de la personalidad a actualizar.
   * @param dto - Datos actualizados de la personalidad.
   * @returns La personalidad actualizada.
   */
  async update(id: number, dto: UpdatePersonalityDto) {
    await this.findOne(id);
    await this.personalityRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Marca una personalidad como eliminada (soft delete).
   *
   * @param id - ID de la personalidad a eliminar.
   * @returns La personalidad marcada como eliminada.
   */
  async remove(id: number) {
    return this.personalityRepository.manager.transaction(async manager => {
      const repo = manager.getRepository(Personality);
      await repo.update(id, { deleted: true });
      return { message: `Deleted ${id}`, deleted: true };
    });
  }
  /**
   * Restaura una personalidad previamente eliminada (soft restore).
   *
   * @param id - ID de la personalidad a restaurar.
   * @returns La personalidad restaurada (estado `deleted` en false).
   */
  async restore(id: number) {
    const personality = await this.findOne(id);
    personality.deleted = false;
    return this.personalityRepository.save(personality);
  }
}