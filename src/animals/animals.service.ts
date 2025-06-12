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
          breed: { id: dto.breedId },
          disease: dto.diseaseId ? { id: dto.diseaseId } : null,
          healthStatus: dto.healthStatus,
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

  // Buscar todos los animales con paginación
  async findAll(page: number = 1, limit: number = 15) {
    const skip = (page - 1) * limit; // Desplazamiento para la paginación

    const result = await this.animalsRepo
      .createQueryBuilder('animals')
      .leftJoinAndSelect('animals.breed', 'breed')
      .leftJoinAndSelect('animals.disease', 'disease')
      .leftJoinAndSelect('animals.characteristics', 'characteristics')
      .select([
        'animals.id AS id',
        'animals.name AS name',
        'breed.name AS breed',
        'disease.name AS disease',
        'animals.healthStatus AS healthStatus',
        'animals.adopted AS adopted',
        'animals.status AS status',
        'animals.information AS information',
        'characteristics.color AS color',
        'characteristics.size AS size',
        'characteristics.weight AS weight',
        'characteristics.fur AS fur',
        'characteristics.sex AS sex',
        'characteristics.age AS age',
        'characteristics.sterilized AS sterilized',
      ])
      .where('animals.deleted = false')
      .orderBy('animals.createdAt', 'ASC') // Ordenar por fecha de creación
      .skip(skip) // Desplazamiento para la paginación
      .take(limit) // Limitar el número de resultados
      .getRawMany();

    // Contamos el total de animales activos
    const totalCount = await this.animalsRepo
      .createQueryBuilder('animals')
      .where('animals.deleted = false')
      .getCount();

    const totalPages = Math.ceil(totalCount / limit);

    return successResponse('Animales activos encontrados', {
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
      },
    });
  }

  // Buscar animal por nombre
  async findByName(name: string) {
    const result = await this.animalsRepo
      .createQueryBuilder('animals')
      .leftJoinAndSelect('animals.breed', 'breed')
      .leftJoinAndSelect('animals.disease', 'disease')
      .leftJoinAndSelect('animals.characteristics', 'characteristics')
      .select([
        'animals.id AS id',
        'animals.name AS name',
        'breed.name AS breed',
        'disease.name AS disease',
        'animals.healthStatus AS healthStatus',
        'animals.adopted AS adopted',
        'animals.status AS status',
        'animals.information AS information',
        'characteristics.color AS color',
        'characteristics.size AS size',
        'characteristics.weight AS weight',
        'characteristics.fur AS fur',
        'characteristics.sex AS sex',
        'characteristics.age AS age',
        'characteristics.sterilized AS sterilized',
      ])
      .where('LOWER(animals.name) LIKE LOWER(:name)', { name: `%${name}%` }) // Búsqueda por nombre (parcial)
      .andWhere('animals.deleted = false')
      .getRawMany();

    if (result.length === 0) return errorResponse('No se encontraron animales con ese nombre');

    return successResponse('Animales encontrados', result);
  }

  async findOne(id: string) {
    const result = await this.animalsRepo
      .createQueryBuilder('animals')
      .leftJoinAndSelect('animals.breed', 'breed')
      .leftJoinAndSelect('animals.disease', 'disease')
      .leftJoinAndSelect('animals.characteristics', 'characteristics')
      .select([
        'animals.id AS id',
        'animals.name AS name',
        'breed.name AS breed',
        'disease.name AS disease',
        'animals.healthStatus AS healthStatus',
        'animals.adopted AS adopted',
        'animals.status AS status',
        'animals.information AS information',
        'characteristics.color AS color',
        'characteristics.size AS size',
        'characteristics.weight AS weight',
        'characteristics.fur AS fur',
        'characteristics.sex AS sex',
        'characteristics.age AS age',
        'characteristics.sterilized AS sterilized',
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
      const updateData: Partial<Animals> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.healthStatus !== undefined) updateData.healthStatus = dto.healthStatus;
      if (dto.adopted !== undefined) updateData.adopted = dto.adopted;
      if (dto.photos !== undefined) updateData.photos = dto.photos;
      if (dto.information !== undefined) updateData.information = dto.information;
      if (dto.status !== undefined) updateData.status = dto.status;

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
