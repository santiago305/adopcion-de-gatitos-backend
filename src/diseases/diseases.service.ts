import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { errorResponse, successResponse } from 'src/common/utils/response';
import { Diseases } from './entities/disease.entity';
import { CreateDiseasesDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Injectable()
export class DiseasesService {
  constructor(
    @InjectRepository(Diseases)
    private readonly diseasesRepo: Repository<Diseases>,
  ) {}

  async create(dto: CreateDiseasesDto) {
    const exists = await this.isDiseaseExisting(dto.name ?? 'ninguno');
    if (exists) return errorResponse('La enfermedad ya existe');
    
    try {
      await this.diseasesRepo
        .createQueryBuilder()
        .insert()
        .into(Diseases)
        .values({
          name: dto.name ?? 'ninguno',
          severity: dto.severity ?? 'ninguna',
        })
        .execute();

      return successResponse('Enfermedad creada exitosamente');
    } catch (error) {
      console.error('[DiseasesService][create]', error);
      throw new UnauthorizedException('No se pudo crear la enfermedad');
    }
  }


  async findAll(page: number = 1, limit: number = 15) {
  const skip = (page - 1) * limit; // Calculamos el desplazamiento (OFFSET)

  const result = await this.diseasesRepo
    .createQueryBuilder('disease')
    .select([
      'disease.id AS id',
      'disease.name AS name',
      'disease.severity AS severity',
      'disease.createdAt AS createdAt',
      'disease.updatedAt AS updatedAt'
    ])
    .where('disease.deleted = false')
    .orderBy('disease.createdAt', 'ASC') // Ordenar por fecha de creación
    .skip(skip) // Desplazamiento para la paginación
    .take(limit) // Limitar el número de resultados
    .getRawMany();

    // Contamos el total de enfermedades activas
    const totalCount = await this.diseasesRepo
      .createQueryBuilder('disease')
      .where('disease.deleted = false')
      .getCount();

    // Calculamos el número total de páginas
    const totalPages = Math.ceil(totalCount / limit);

    return successResponse('Enfermedades activas encontradas', {
      data: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount
      }
    });
  }


  async findOne(id: string) {
    const result = await this.diseasesRepo
      .createQueryBuilder('disease')
      .select([
        'disease.id AS id',
        'disease.name As name',
        'disease.severity AS severity',
        'disease.createdAt AS createdAt', // Incluir createdAt
        'disease.updatedAt AS updatedAt'
      ])
      .where('disease.id = :id', { id })
      .andWhere('disease.deleted = false')
      .getRawOne();

    if (!result) return errorResponse('No se encontró la enfermedad');

    return successResponse('Enfermedad encontrada', result);
  }

  async update(id: string, dto: UpdateDiseaseDto) {
    await this.findOne(id);
    try {
      const updateData: Partial<Diseases> = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.severity !== undefined) updateData.severity = dto.severity;

      await this.diseasesRepo
        .createQueryBuilder()
        .update(Diseases)
        .set(updateData)
        .where('id = :id', { id })
        .execute();

      return successResponse('Enfermedad actualizada');
    } catch (error) {
      console.error('[DiseasesService][update]', error);
      throw new UnauthorizedException('No se pudo actualizar la enfermedad');
    }
  }

  private async toggleDelete(
    id: string,
    deleted: boolean,
    successMsg: string,
    errorMsg: string,
  ) {
    try {
      await this.diseasesRepo
        .createQueryBuilder()
        .update(Diseases)
        .set({ deleted })
        .where('id = :id', { id })
        .execute();

      return successResponse(successMsg);
    } catch (error) {
      console.error('[DiseasesService][toggleDelete]', error);
      throw new UnauthorizedException(errorMsg);
    }
  }

  async remove(id: string) {
    return this.toggleDelete(
      id,
      true,
      'Enfermedad eliminada correctamente',
      'No se pudo eliminar la enfermedad',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Enfermedad restaurada correctamente',
      'No se pudo restaurar la enfermedad',
    );
  }

  async isDiseaseExisting(name: string): Promise<boolean> {
    const result = await this.diseasesRepo
      .createQueryBuilder('disease')
      .where('LOWER(disease.name) = LOWER(:name)', { name })
      .getExists()

    return result;
  }

  async findByName(name: string) {
    const result = await this.diseasesRepo
      .createQueryBuilder('disease')
      .select([
        'disease.id AS id',
        'disease.name AS name',
        'disease.severity AS severity',
        'disease.createdAt AS createdAt',
        'disease.updatedAt AS updatedAt'
      ])
      .where('LOWER(disease.name) LIKE LOWER(:name)', { name: `%${name}%` }) // Búsqueda parcial
      .andWhere('disease.deleted = false') // Asegurarse de que no esté eliminada
      .getRawMany(); // Usamos getRawMany() porque esperamos múltiples resultados

    if (result.length === 0) return errorResponse('No se encontraron enfermedades con ese nombre');

    return successResponse('Enfermedades encontradas', result);
  }

}
