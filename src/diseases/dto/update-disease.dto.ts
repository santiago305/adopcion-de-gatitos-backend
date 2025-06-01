import { PartialType } from '@nestjs/mapped-types';
import { CreateDiseasesDto } from './create-disease.dto';

export class UpdateDiseaseDto extends PartialType(CreateDiseasesDto) {}
