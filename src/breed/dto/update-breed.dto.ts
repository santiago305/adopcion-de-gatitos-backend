import { IsOptional, IsString } from 'class-validator';

export class UpdateBreedDto {
  @IsOptional()
  @IsString({ message: 'El nombre de la raza debe ser un texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El ID de especie debe ser un texto' })
  speciesId?: string;
}
