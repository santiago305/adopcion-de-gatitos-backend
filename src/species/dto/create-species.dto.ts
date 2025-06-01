import { IsNotEmpty, IsString } from "class-validator";

export class CreateSpeciesDto {
  @IsString({ message: 'El nombre de la especie debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre de la especie es obligatorio.' })
  name: string;
}