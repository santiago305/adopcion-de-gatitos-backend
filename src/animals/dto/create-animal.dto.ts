import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAnimalsDto {
  @IsString({ message: 'El nombre del animal debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre del animal es obligatorio.' })
  name: string;

  @IsString({ message: 'El ID de raza debe ser un texto.' })
  @IsNotEmpty({ message: 'La raza es obligatoria.' })
  breedId: string;

  @IsString({ message: 'El ID de la enfermedad debe ser un texto.' })
  @IsNotEmpty({ message: 'El ID de la enfermedad es obligatorio.' })
  diseaseId: string;

  @IsNotEmpty({ message: 'El estado de salud es obligatorio.' })
  healthStatus: boolean;

  @IsNotEmpty({ message: 'El estado de adopción es obligatorio.' })
  adopted: boolean;

  @IsString({ message: 'La foto debe ser una cadena de texto.' })
  @IsOptional()  // No es obligatorio, puede no enviarse si no se va a cargar una foto
  photos: string;  // Solo una foto ahora, no un array

  @IsNotEmpty({ message: 'El ID de las características es obligatorio.' })
  @IsString({ message: 'El ID de las características debe ser un texto.' })
  characteristicsId: string;

  @IsNotEmpty({ message: 'La información del animal es obligatoria.' })
  @IsString({ message: 'La información del animal debe ser un texto.' })
  information: string;

  @IsOptional()
  status?: boolean;
}
