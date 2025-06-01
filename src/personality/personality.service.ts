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
    private readonly personalityRepo: Repository<Personality>
  ) {}

  async create(dto: CreatePersonalityDto) {
    try {
      await this.personalityRepo
        .createQueryBuilder()
        .insert()
        .into(Personality)
        .values({ name: dto.name })
        .execute();

      return successResponse('Personalidad creada exitosamente');
    } catch (error) {
      console.error('[PersonalityService][create]', error);
      throw new UnauthorizedException('No se pudo crear la personalidad');
    }
  }

  async findAll() {
    const result = await this.personalityRepo
      .createQueryBuilder('personality')
      .where('personality.deleted = false')
      .getMany();

    return successResponse('Personalidades encontradas', result);
  }

  async findOne(id: string) {
    const result = await this.personalityRepo
      .createQueryBuilder('personality')
      .where('personality.id = :id', { id })
      .andWhere('personality.deleted = false')
      .getOne();

    if (!result) return errorResponse('No se encontró la personalidad');
    return successResponse('Personalidad encontrada', result);
  }

  async update(id: string, dto: UpdatePersonalityDto) {
    await this.findOne(id);
    try {
      await this.personalityRepo
        .createQueryBuilder()
        .update(Personality)
        .set({ name: dto.name })
        .where('id = :id', { id })
        .execute();

      return successResponse('Personalidad actualizada');
    } catch (error) {
      console.error('[PersonalityService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar la personalidad');
    }
  }

  private async toggleDelete(id: string, deleted: boolean, successMsg: string, errorMsg: string) {
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
    return this.toggleDelete(id, true, 'Personalidad desactivada', 'No se pudo desactivar la personalidad');
  }

  async restore(id: string) {
    return this.toggleDelete(id, false, 'Personalidad reactivada', 'No se pudo reactivar la personalidad');
  }
}