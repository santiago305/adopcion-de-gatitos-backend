import { IsNotEmpty, IsString } from "class-validator";

export class CreateBreedDto {
  @IsString({ message: 'El nombre de la raza debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre de la raza es obligatorio.' })
  name: string;

  @IsString({ message: 'El ID de especie debe ser un texto' })
  @IsNotEmpty({ message: 'El ID de especie es obligatorio.' })
  speciesId: string;
}