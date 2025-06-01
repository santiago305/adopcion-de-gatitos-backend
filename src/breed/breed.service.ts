import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  async create(dto: CreateBreedDto) {
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
      .leftJoinAndSelect('breed.species', 'species')
      .where('breed.deleted = false')
      .getMany();

    return successResponse('Razas activas encontradas', result);
  }

  async findOne(id: string) {
    const result = await this.breedRepo
      .createQueryBuilder('breed')
      .leftJoinAndSelect('breed.species', 'species')
      .where('breed.id = :id', { id })
      .andWhere('breed.deleted = false')
      .getOne();

    if (!result) return errorResponse('No se encontró la raza');

    return successResponse('Raza encontrada', result);
  }

  async update(id: string, dto: UpdateBreedDto) {
    await this.findOne(id);
    try {
      const updateData: Partial<Breed> = {
        name: dto.name,
      };

      if (dto.speciesId) {
        updateData.speciesId = dto.speciesId;
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
      'Raza desactivada',
      'No se pudo desactivar la raza',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Raza reactivada',
      'No se pudo reactivar la raza',
    );
  }
}
