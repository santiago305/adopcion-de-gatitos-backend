import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Breed } from './entities/breed.entity';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { errorResponse, successResponse } from 'src/common/utils/response';

@Injectable()
export class BreedService {
  constructor(
    @InjectRepository(Breed)
    private readonly breedRepo: Repository<Breed>,
  ) {}
    async isBreedExisting(name: string) {
    const result = await this.breedRepo
      .createQueryBuilder('breed')
      .where('LOWER(breed.name) = LOWER(:name)', { name })
      .getOne();

    return result;
  }

  async create(dto: CreateBreedDto) {
    const breedExisting = await this.isBreedExisting(dto.name)
    if(breedExisting) throw new BadRequestException('Esta raza ya esta registrada')
    try {
      await this.breedRepo
        .createQueryBuilder()
        .insert()
        .into(Breed)
        .values({
          name: dto.name,
          species: { id: dto.speciesId },
        })
        .execute();

      return successResponse('Raza creada exitosamente');
    } catch (error) {
      console.error('[BreedService][create]', error);
      throw new UnauthorizedException('No se pudo crear la raza');
    }
  }

  async findAll() {
    const result = await this.breedRepo
      .createQueryBuilder('breed')
      .leftJoin('breed.species', 'species')
      .select([
        'breed.id AS id',
        'breed.name AS raza',
        'species.name AS especie',
      ])
      .where('breed.deleted = false')
      .getRawMany();

    return successResponse('Razas activas encontradas', result);
}


  async findOne(id: string) {
    const result = await this.breedRepo
      .createQueryBuilder('breed')
      .leftJoinAndSelect('breed.species', 'species')
      .select([
        'breed.id AS id',
        'breed.name AS raza',
        'species.name AS especie',
      ])
      .where('breed.id = :id', { id })
      .andWhere('breed.deleted = false')
      .getRawOne();

    if (!result) return errorResponse('No se encontró la raza');

    return successResponse('Raza encontrada', result);
  }

  async update(id: string, dto: UpdateBreedDto) {
    await this.findOne(id);

    try {
      const updateData: Partial<Breed> = {};

      if (dto.name !== undefined) {
        updateData.name = dto.name;
      }

      if (dto.speciesId !== undefined) {
        updateData.speciesId = dto.speciesId;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('Debes enviar al menos un campo para actualizar');
      }

      await this.breedRepo
        .createQueryBuilder()
        .update(Breed)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      return successResponse('Raza actualizada');
    } catch (error) {
      console.error('[BreedService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar la raza');
    }
  }

  private async toggleDelete(
    id: string,
    deleted: boolean,
    successMsg: string,
    errorMsg: string,
  ) {
    try {
      await this.breedRepo
        .createQueryBuilder()
        .update(Breed)
        .set({ deleted })
        .where('id = :id', { id })
        .execute();

      return successResponse(successMsg);
    } catch (error) {
      console.error('[BreedService][toggleDelete]', error);
      throw new UnauthorizedException(errorMsg);
    }
  }

  async remove(id: string) {
    return this.toggleDelete(
      id,
      true,
      'Raza eliminada correctamente',
      'No se pudo eliminar la raza',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Raza restaurada correctamente',
      'No se pudo restaurar la raza',
    );
  }
}
