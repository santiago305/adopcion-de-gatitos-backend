import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Characteristics } from './entities/characteristic.entity';
import { CreateCharacteristicsDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';
import { errorResponse, successResponse } from 'src/common/utils/response';

@Injectable()
export class CharacteristicsService {
  constructor(
    @InjectRepository(Characteristics)
    private readonly repo: Repository<Characteristics>,
  ) {}

  async create(dto: CreateCharacteristicsDto) {
    const exists = await this.isCharacteristicDuplicate(dto);
    if (exists) return errorResponse('Ya existe una característica similar');

    try {
      await this.repo
        .createQueryBuilder()
        .insert()
        .into(Characteristics)
        .values({
          color: dto.color,
          size: dto.size,
          weight: dto.weight,
          fur: dto.fur,
          sex: dto.sex,
          age: dto.age,
          sterilized: dto.sterilized,
          personalityId: dto.personalityId
        })
        .execute();

      return successResponse('Características creadas exitosamente');
    } catch (error) {
      console.error('[CharacteristicsService][create]', error);
      throw new UnauthorizedException('No se pudo crear la característica');
    }
  }

  async findAll(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit;

    const result = await this.repo
      .createQueryBuilder('c')
      .leftJoin('c.personality', 'p')
      .select([
        'c.id AS id',
        'c.color AS color',
        'c.size AS size',
        'c.weight AS weight',
        'c.fur AS fur',
        'c.sex AS sex',
        'c.age AS age',
        'c.sterilized AS sterilized',
        'c.createdAt AS createdAt',
        'c.updatedAt AS updatedAt',
        'p.name AS personality'
      ])
      .where('c.deleted = false')
      .orderBy('c.createdAt', 'ASC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    const totalCount = await this.repo
      .createQueryBuilder('c')
      .where('c.deleted = false')
      .getCount();

    return successResponse('Características encontradas', {
      data: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  }

  async findOne(id: string) {
    const result = await this.repo
      .createQueryBuilder('c')
      .leftJoin('c.personality', 'p')
      .select([
        'c.id AS id',
        'c.color AS color',
        'c.size AS size',
        'c.weight AS weight',
        'c.fur AS fur',
        'c.sex AS sex',
        'c.age AS age',
        'c.sterilized AS sterilized',
        'c.createdAt AS createdAt',
        'c.updatedAt AS updatedAt',
        'p.name AS personality'
      ])
      .where('c.id = :id', { id })
      .andWhere('c.deleted = false')
      .getRawOne();

    if (!result) return errorResponse('No se encontró la característica');

    return successResponse('Característica encontrada', result);
  }

  async findByPersonalityName(name: string) {
    const result = await this.repo
      .createQueryBuilder('c')
      .leftJoin('c.personality', 'p')
      .select([
        'c.id AS id',
        'c.color AS color',
        'c.size AS size',
        'c.weight AS weight',
        'c.fur AS fur',
        'c.sex AS sex',
        'c.age AS age',
        'c.sterilized AS sterilized',
        'c.createdAt AS createdAt',
        'c.updatedAt AS updatedAt',
        'p.name AS personality'
      ])
      .where('LOWER(p.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .andWhere('c.deleted = false')
      .getRawMany();

    if (result.length === 0) return errorResponse('No se encontraron coincidencias');

    return successResponse('Resultados encontrados', result);
  }

  async update(id: string, dto: UpdateCharacteristicDto) {
    await this.findOne(id);
    try {
      const updateData = Object.entries(dto)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      await this.repo
        .createQueryBuilder()
        .update(Characteristics)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      return successResponse('Características actualizadas');
    } catch (error) {
      console.error('[CharacteristicsService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar');
    }
  }

  private async toggleDelete(id: string, deleted: boolean, successMsg: string, errorMsg: string) {
    try {
      await this.repo
        .createQueryBuilder()
        .update(Characteristics)
        .set({ deleted })
        .where('id = :id', { id })
        .execute();

      return successResponse(successMsg);
    } catch (error) {
      console.error('[CharacteristicsService][toggleDelete]', error);
      throw new UnauthorizedException(errorMsg);
    }
  }

  async remove(id: string) {
    return this.toggleDelete(id, true, 'Características eliminadas', 'Error al eliminar');
  }

  async restore(id: string) {
    return this.toggleDelete(id, false, 'Características restauradas', 'Error al restaurar');
  }

  async isCharacteristicDuplicate(dto: CreateCharacteristicsDto): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder('c')
      .where('LOWER(c.color) = LOWER(:color)', { color: dto.color })
      .andWhere('LOWER(c.fur) = LOWER(:fur)', { fur: dto.fur })
      .andWhere('c.sex = :sex', { sex: dto.sex })
      .andWhere('c.deleted = false')
      .getExists();

    return result;
  }

  async findByKeyword(keyword: string) {
    const result = await this.repo
      .createQueryBuilder('c')
      .leftJoin('c.personality', 'p')
      .select([
        'c.id AS id',
        'c.color AS color',
        'c.size AS size',
        'c.weight AS weight',
        'c.fur AS fur',
        'c.sex AS sex',
        'c.age AS age',
        'c.sterilized AS sterilized',
        'c.createdAt AS createdAt',
        'c.updatedAt AS updatedAt',
        'p.name AS personality'
      ])
      .where('c.deleted = false')
      .andWhere(
        `
        LOWER(c.color) LIKE LOWER(:kw) OR
        LOWER(c.size) LIKE LOWER(:kw) OR
        LOWER(c.weight) LIKE LOWER(:kw) OR
        LOWER(c.fur) LIKE LOWER(:kw) OR
        LOWER(c.sex) LIKE LOWER(:kw) OR
        LOWER(c.age) LIKE LOWER(:kw) OR
        LOWER(p.name) LIKE LOWER(:kw)
      `,
        { kw: `%${keyword}%` }
      )
      .orderBy('c.createdAt', 'ASC')
      .getRawMany();

    if (result.length === 0)
      return errorResponse('No se encontraron coincidencias');

    return successResponse('Resultados encontrados', result);
  }

}

