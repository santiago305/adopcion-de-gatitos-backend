import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { errorResponse, successResponse } from 'src/common/utils/response';
import { Animals } from './entities/animal.entity';
import { CreateAnimalsDto } from './dto/create-animal.dto';
import { UpdateAnimalsDto } from './dto/update-animal.dto';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(Animals)
    private readonly animalsRepo: Repository<Animals>,
  ) {}

  async create(dto: CreateAnimalsDto) {
    try {
      await this.animalsRepo
        .createQueryBuilder()
        .insert()
        .into(Animals)
        .values({
          name: dto.name,
          species: { id: dto.speciesId },
          breed: { id: dto.breedId },
          disease: dto.diseaseId ? { id: dto.diseaseId } : null,
          healthStatus: dto.healthStatus,
          entryDate: dto.entryDate,
          adopted: dto.adopted ?? false,
          photos: dto.photos,
          characteristics: dto.characteristicsId ? { id: dto.characteristicsId } : null,
          information: dto.information,
          status: dto.status ?? true,
        })
        .execute();

      return successResponse('Animal creado exitosamente');
    } catch (error) {
      console.error('[AnimalsService][create]', error);
      throw new UnauthorizedException('No se pudo crear el animal');
    }
  }

  async findAll() {
    const result = await this.animalsRepo
      .createQueryBuilder('animals')
      .leftJoinAndSelect('animals.species', 'species')
      .leftJoinAndSelect('animals.breed', 'breed')
      .leftJoinAndSelect('animals.disease', 'disease')
      .leftJoinAndSelect('animals.characteristics', 'characteristics')
      .select([
        'animals.id AS id',
        'animals.name AS name',
        'species.name AS species',
        'breed.name AS breed',
        'disease.name AS disease',
        'animals.healthStatus AS healthStatus',
        'animals.entryDate AS entryDate',
        'animals.adopted AS adopted',
        'animals.status AS status',
        'animals.deleted AS deleted',
        'animals.information AS information',
      ])
      .andWhere('animals.deleted = false')
      .getRawMany();

    return successResponse('Animales activos encontrados', result);
  }

  async findOne(id: string) {
    const result = await this.animalsRepo
      .createQueryBuilder('animals')
      .leftJoinAndSelect('animals.species', 'species')
      .leftJoinAndSelect('animals.breed', 'breed')
      .leftJoinAndSelect('animals.disease', 'disease')
      .leftJoinAndSelect('animals.characteristics', 'characteristics')
      .select([
        'animals.id AS id',
        'animals.name AS name',
        'species.name AS species',
        'breed.name AS breed',
        'disease.name AS disease',
        'animals.healthStatus AS healthStatus',
        'animals.entryDate AS entryDate',
        'animals.adopted AS adopted',
        'animals.status AS status',
        'animals.deleted AS deleted',
        'animals.information AS information',
      ])
      .where('animals.id = :id', { id })
      .andWhere('animals.deleted = false')
      .getRawOne();

    if (!result) return errorResponse('No se encontró el animal');

    return successResponse('Animal encontrado', result);
  }

  async update(id: string, dto: UpdateAnimalsDto) {
    await this.findOne(id);
    try {
      const updateData: Partial<Animals> = {
        name: dto.name,
        healthStatus: dto.healthStatus,
        entryDate: dto.entryDate,
        adopted: dto.adopted,
        photos: dto.photos,
        information: dto.information,
        status: dto.status,
      };

      if (dto.speciesId) updateData.species = { id: dto.speciesId } as any;
      if (dto.breedId) updateData.breed = { id: dto.breedId } as any;
      if (dto.diseaseId) updateData.disease = { id: dto.diseaseId } as any;
      if (dto.characteristicsId) updateData.characteristics = { id: dto.characteristicsId } as any;

      await this.animalsRepo
        .createQueryBuilder()
        .update(Animals)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      return successResponse('Animal actualizado');
    } catch (error) {
      console.error('[AnimalsService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar el animal');
    }
  }

  private async toggleDelete(
    id: string,
    deleted: boolean,
    successMsg: string,
    errorMsg: string,
  ) {
    try {
      await this.animalsRepo
        .createQueryBuilder()
        .update(Animals)
        .set({ deleted })
        .where('id = :id', { id })
        .execute();

      return successResponse(successMsg);
    } catch (error) {
      console.error('[AnimalsService][toggleDelete]', error);
      throw new UnauthorizedException(errorMsg);
    }
  }

  async remove(id: string) {
    return this.toggleDelete(
      id,
      true,
      'Animal eliminado correctamente',
      'No se pudo eliminar el animal',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Animal restaurado correctamente',
      'No se pudo restaurar el animal',
    );
  }
}
