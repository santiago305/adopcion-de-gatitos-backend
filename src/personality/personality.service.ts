import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personality } from './entities/personality.entity';
import { CreatePersonalityDto } from './dto/create-personality.dto';
import { UpdatePersonalityDto } from './dto/update-personality.dto';
import { errorResponse, successResponse } from 'src/common/utils/response';

@Injectable()
export class PersonalityService {
  constructor(
    @InjectRepository(Personality)
    private readonly personalityRepo: Repository<Personality>,
  ) {}

  async isPersonalityExisting(name: string): Promise<boolean> {
    return await this.personalityRepo
      .createQueryBuilder('personality')
      .where('LOWER(personality.name) = LOWER(:name)', { name })
      .getExists();
  }

  async create(dto: CreatePersonalityDto) {
    const exists = await this.isPersonalityExisting(dto.name ?? 'ninguno');
    if (exists) return errorResponse('La personalidad ya existe');

    try {
      await this.personalityRepo
        .createQueryBuilder()
        .insert()
        .into(Personality)
        .values({ name: dto.name ?? 'ninguno' })
        .execute();

      return successResponse('Personalidad creada exitosamente');
    } catch (error) {
      console.error('[PersonalityService][create]', error);
      throw new UnauthorizedException('No se pudo crear la personalidad');
    }
  }

  async findAll(page = 1, limit = 15) {
    const skip = (page - 1) * limit;

    const result = await this.personalityRepo
      .createQueryBuilder('personality')
      .select([
        'personality.id AS id',
        'personality.name AS name',
        'personality.createdAt AS "createdAt"',
        'personality.updatedAt AS "updatedAt"',
      ])
      .where('personality.deleted = false')
      .orderBy('personality.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    const totalCount = await this.personalityRepo
      .createQueryBuilder('personality')
      .where('personality.deleted = false')
      .getCount();

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse('Personalidades encontradas', {
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      },
    });
  }

  async findByName(name: string) {
    const result = await this.personalityRepo
      .createQueryBuilder('personality')
      .select([
        'personality.id AS id',
        'personality.name AS name',
        'personality.createdAt AS "createdAt"',
        'personality.updatedAt AS "updatedAt"',
      ])
      .where('LOWER(personality.name) LIKE LOWER(:name)', {
        name: `%${name}%`,
      })
      .andWhere('personality.deleted = false')
      .getRawMany();

    if (result.length === 0)
      return errorResponse('No se encontraron personalidades');

    return successResponse('Personalidades encontradas', result);
  }

  async findOne(id: string) {
    const result = await this.personalityRepo
      .createQueryBuilder('personality')
      .select([
        'personality.id AS id',
        'personality.name AS name',
        'personality.createdAt AS "createdAt"',
        'personality.updatedAt AS "updatedAt"',
      ])
      .where('personality.id = :id', { id })
      .andWhere('personality.deleted = false')
      .getRawOne();

    if (!result) return errorResponse('No se encontró la personalidad');
    return successResponse('Personalidad encontrada', result);
  }

  async update(id: string, dto: UpdatePersonalityDto) {
    await this.findOne(id);
    try {
      const updateData: Partial<Personality> = {};
      if (dto.name !== undefined) updateData.name = dto.name;

      await this.personalityRepo
        .createQueryBuilder()
        .update(Personality)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      return successResponse('Personalidad actualizada');
    } catch (error) {
      console.error('[PersonalityService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar la personalidad');
    }
  }

  private async toggleDelete(
    id: string,
    deleted: boolean,
    successMsg: string,
    errorMsg: string,
  ) {
    try {
      await this.personalityRepo
        .createQueryBuilder()
        .update(Personality)
        .set({ deleted })
        .where('id = :id', { id })
        .execute();

      return successResponse(successMsg);
    } catch (error) {
      console.error('[PersonalityService][toggleDelete]', error);
      throw new UnauthorizedException(errorMsg);
    }
  }

  async remove(id: string) {
    return this.toggleDelete(
      id,
      true,
      'Personalidad eliminada correctamente',
      'No se pudo eliminar la personalidad',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Personalidad restaurada correctamente',
      'No se pudo restaurar la personalidad',
    );
  }
}
