import { IsOptional } from 'class-validator';

export class CreateDiseasesDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  severity?: string;
}