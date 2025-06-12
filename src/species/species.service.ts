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
    const exists = await this.isSpeciesExisting(dto.name ?? 'ninguno');
    if (exists) return errorResponse('La especie ya existe');

    try {
      await this.speciesRepo
        .createQueryBuilder()
        .insert()
        .into(Species)
        .values({ name: dto.name ?? 'ninguno' })
        .execute();

      return successResponse('Especie creada exitosamente');
    } catch (error) {
      console.error('[SpeciesService][create]', error);
      throw new UnauthorizedException('No se pudo crear la especie');
    }
  }

  async findAll(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;

    const result = await this.speciesRepo
      .createQueryBuilder('species')
      .select([
        'species.id AS id',
        'species.name AS name',
        'species.createdAt AS createdAt',
        'species.updatedAt AS updatedAt'
      ])
      .where('species.deleted = false')
      .orderBy('species.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    const totalCount = await this.speciesRepo
      .createQueryBuilder('species')
      .where('species.deleted = false')
      .getCount();

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse('Especies activas encontradas', {
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      },
    });
  }

  async findOne(id: string) {
    const result = await this.speciesRepo
      .createQueryBuilder('species')
      .select([
        'species.id AS id',
        'species.name AS name',
        'species.createdAt AS createdAt',
        'species.updatedAt AS updatedAt'
      ])
      .where('species.id = :id', { id })
      .andWhere('species.deleted = false')
      .getRawOne();

    if (!result) return errorResponse('No se encontró la especie');

    return successResponse('Especie encontrada', result);
  }

  async update(id: string, dto: UpdateSpeciesDto) {
    await this.findOne(id);

    try {
      const updateData: Partial<Species> = {};
      if (dto.name !== undefined) updateData.name = dto.name;

      await this.speciesRepo
        .createQueryBuilder()
        .update(Species)
        .set(updateData)
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
      'Especie desactivada',
      'No se pudo desactivar la especie',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Especie reactivada',
      'No se pudo reactivar la especie',
    );
  }

  async isSpeciesExisting(name: string): Promise<boolean> {
    return this.speciesRepo
      .createQueryBuilder('species')
      .where('LOWER(species.name) = LOWER(:name)', { name })
      .getExists();
  }

  async findByName(name: string) {
    const result = await this.speciesRepo
      .createQueryBuilder('species')
      .select([
        'species.id AS id',
        'species.name AS name',
        'species.createdAt AS createdAt',
        'species.updatedAt AS updatedAt'
      ])
      .where('LOWER(species.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .andWhere('species.deleted = false')
      .getRawMany();

    if (result.length === 0) return errorResponse('No se encontraron especies con ese nombre');

    return successResponse('Especies encontradas', result);
  }
}
