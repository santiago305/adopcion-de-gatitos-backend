import { IsIn, IsOptional } from 'class-validator';

export class CreateDiseasesDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsIn(['ninguna', 'leve', 'media', 'grave'], {
    message: 'La gravedad debe ser una de las siguientes: ninguna, leve, media o grave.'
  })
  severity?: string;
}