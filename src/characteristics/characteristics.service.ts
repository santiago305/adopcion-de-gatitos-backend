import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { errorResponse, successResponse } from 'src/common/utils/response';
import { Characteristics } from './entities/characteristic.entity';
import { CreateCharacteristicsDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';

@Injectable()
export class CharacteristicsService {
  constructor(
    @InjectRepository(Characteristics)
    private readonly characteristicsRepo: Repository<Characteristics>,
  ) {}

  async create(dto: CreateCharacteristicsDto) {
    try {
      await this.characteristicsRepo
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
          personality: { id: dto.personalityId }
        })
        .execute();

      return successResponse('Características creadas exitosamente');
    } catch (error) {
      console.error('[CharacteristicsService][create]', error);
      throw new UnauthorizedException('No se pudo crear las características');
    }
  }

  async findAll() {
    const result = await this.characteristicsRepo
      .createQueryBuilder('characteristics')
      .leftJoinAndSelect('characteristics.personality', 'personality')
      .where('characteristics.deleted = false')
      .getMany();

    return successResponse('Características activas encontradas', result);
  }

  async findOne(id: string) {
    const result = await this.characteristicsRepo
      .createQueryBuilder('characteristics')
      .leftJoinAndSelect('characteristics.personality', 'personality')
      .where('characteristics.id = :id', { id })
      .andWhere('characteristics.deleted = false')
      .getOne();

    if (!result) return errorResponse('No se encontraron las características');

    return successResponse('Características encontradas', result);
  }

  async update(id: string, dto: UpdateCharacteristicDto
  ) {
    await this.findOne(id);
    try {
      const updateData: Partial<Characteristics> = {
        color: dto.color,
        size: dto.size,
        weight: dto.weight,
        fur: dto.fur,
        sex: dto.sex,
        age: dto.age,
        sterilized: dto.sterilized,
      };
      if (dto.personalityId) {
        updateData.personalityId = dto.personalityId;
      }

      await this.characteristicsRepo
        .createQueryBuilder()
        .update(Characteristics)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      return successResponse('Características actualizadas');
    } catch (error) {
      console.error('[CharacteristicsService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar las características');
    }
  }

  private async toggleDelete(
    id: string,
    deleted: boolean,
    successMsg: string,
    errorMsg: string,
  ) {
    try {
      await this.characteristicsRepo
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
    return this.toggleDelete(
      id,
      true,
      'Características desactivadas',
      'No se pudieron desactivar las características',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Características reactivadas',
      'No se pudieron reactivar las características',
    );
  }
}
