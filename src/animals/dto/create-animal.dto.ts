import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateAnimalDto {}
export class CreateAnimalsDto {
  @IsNotEmpty({ message: 'El nombre del animal es obligatorio.' })
  name: string;

  @IsNotEmpty({ message: 'La especie es obligatoria.' })
  speciesId: number;

  @IsNotEmpty({ message: 'La raza es obligatoria.' })
  breedId: number;

  @IsOptional()
  diseaseId?: number;

  @IsOptional()
  healthStatus?: boolean;

  @IsOptional()
  entryDate?: Date;

  @IsOptional()
  adopted?: boolean;

  @IsOptional()
  photos?: string[];

  @IsOptional()
  characteristicsId?: number;

  @IsOptional()
  information?: string;

  @IsOptional()
  status?: boolean;
}