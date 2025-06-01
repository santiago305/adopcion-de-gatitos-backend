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

  async findAll() {
    const result = await this.diseasesRepo
      .createQueryBuilder('disease')
      .where('disease.deleted = false')
      .getMany();

    return successResponse('Enfermedades activas encontradas', result);
  }

  async findOne(id: string) {
    const result = await this.diseasesRepo
      .createQueryBuilder('disease')
      .where('disease.id = :id', { id })
      .andWhere('disease.deleted = false')
      .getOne();

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
      'Enfermedad desactivada',
      'No se pudo desactivar la enfermedad',
    );
  }

  async restore(id: string) {
    return this.toggleDelete(
      id,
      false,
      'Enfermedad reactivada',
      'No se pudo reactivar la enfermedad',
    );
  }
}
