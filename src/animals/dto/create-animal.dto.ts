import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAnimalsDto {
  @IsString({ message: 'El nombre del animal debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre del animal es obligatorio.' })
  name: string;

  @IsString({ message: 'El ID de especie debe ser un texto.' })
  @IsNotEmpty({ message: 'La especie es obligatoria.' })
  speciesId: string;

  @IsString({ message: 'El ID de raza debe ser un texto.' })
  @IsNotEmpty({ message: 'La raza es obligatoria.' })
  breedId: string;

  @IsString({ message: 'El ID de la enfermedad debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID de la enfermedad es obligatorio.' })
  diseaseId: string;

  @IsNotEmpty({ message: 'El estado de salud es obligatorio.' })
  healthStatus: boolean;

  @IsNotEmpty({ message: 'La fecha de ingreso es obligatoria.' })
  @IsDateString()
  entryDate: string;

  @IsNotEmpty({ message: 'El estado de adopción es obligatorio.' })
  adopted: boolean;

  @IsNotEmpty({ message: 'Las fotos son obligatorias.' })
  @IsString({ each: true, message: 'Cada foto debe ser una cadena de texto.' })
  photos: string[];

  @IsNotEmpty( { message: 'El ID de las características es obligatorio.' })
  @IsString({ message: 'El ID de las características debe ser un texto.' })
  characteristicsId: string;

  @IsNotEmpty(  { message: 'La información del animal es obligatoria.' })
  @IsString({ message: 'La información del animal debe ser un texto.' })
  information: string;

  @IsOptional()
  status?: boolean;
}