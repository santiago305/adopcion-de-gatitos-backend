import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePersonalityDto {
  @IsString({ message: 'El nombre de la personalidad debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de la personalidad es obligatorio.' })
  name: string;
}