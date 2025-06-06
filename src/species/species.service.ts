import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Species } from './entities/species.entity';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { errorResponse, successResponse } from 'src/common/utils/response';

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(Species)
    private readonly speciesRepo: Repository<Species>,
  ) {}

  async create(dto: CreateSpeciesDto) {
    try {
      await this.speciesRepo
        .createQueryBuilder()
        .insert()
        .into(Species)
        .values({ name: dto.name })
        .execute();

      return successResponse('Especie creada exitosamente');
    } catch (error) {
      console.error('[SpeciesService][create]', error);
      throw new UnauthorizedException('No se pudo crear la especie');
    }
  }

  async findAll() {
    const result = await this.speciesRepo
      .createQueryBuilder('species')
      
      .where('species.deleted = false')
      .getMany();

    return successResponse('Especies activas encontradas', result);
  }

  async findOne(id: string) {
    const result = await this.speciesRepo
      .createQueryBuilder('species')
      .where('species.id = :id', { id })
      .andWhere('species.deleted = false')
      .getOne();

    if (!result) return errorResponse('No se encontró la especie');

    return successResponse('Especie encontrada', result);
  }

  async update(id: string, dto: UpdateSpeciesDto) {
    await this.findOne(id);
    try {
      await this.speciesRepo
        .createQueryBuilder()
        .update(Species)
        .set({ name: dto.name })
        .where('id = :id', { id })
        .execute();

      return successResponse('Especie actualizada');
    } catch (error) {
      console.error('[SpeciesService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar la especie');
    }
  }

  private async toggleDelete(
    id: string,
    deleted: boolean,
    successMsg: string,
    errorMsg: string,
  ) {
    try {
      await this.speciesRepo
        .createQueryBuilder()
        .update(Species)
        .set({ deleted })
        .where('id = :id', { id })
        .execute();

      return successResponse(successMsg);
    } catch (error) {
      console.error('[SpeciesService][toggleDelete]', error);
      throw new UnauthorizedException(errorMsg);
    }
  }

  async remove(id: string) {
    return this.toggleDelete(
      id,
      true,
      'Especie eliminada',
      'No se pudo eliminar la especie',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Especie restaurada',
      'No se pudo restaurar la especie',
    );
  }
}
