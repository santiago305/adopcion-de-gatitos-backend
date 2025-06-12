import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateAnimalsDto {
  @IsOptional()
  @IsString({ message: 'El nombre del animal debe ser un texto.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El ID de raza debe ser un texto.' })
  breedId?: string;

  @IsOptional()
  @IsString({ message: 'El ID de la enfermedad debe ser un texto.' })
  diseaseId?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado de salud debe ser un valor booleano.' })
  healthStatus?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'El estado de adopción debe ser un valor booleano.' })
  adopted?: boolean;

  @IsOptional()
  @IsString({ message: 'La foto debe ser una cadena de texto.' })
  photos?: string;  // Solo una foto

  @IsOptional()
  @IsString({ message: 'El ID de las características debe ser un texto.' })
  characteristicsId?: string;

  @IsOptional()
  @IsString({ message: 'La información del animal debe ser un texto.' })
  information?: string;

  @IsOptional()
  @IsBoolean({ message: 'El estado del animal debe ser un valor booleano.' })
  status?: boolean;
}
