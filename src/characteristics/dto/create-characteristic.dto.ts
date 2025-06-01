import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateCharacteristicsDto {
  @IsNotEmpty({ message: 'El Color es obligatorio.' }) 
  @IsString({ message: 'Color debe ser un texto.' })
  color: string;

  @IsNotEmpty({ message: 'El Tamaño es obligatorio.' })
  @IsString({ message: 'Tamaño debe ser un texto.' })
  size?: string;

  @IsNotEmpty({ message: 'El Peso es obligatorio.' }) 
  @IsString({ message: 'Peso debe ser un número.' })
  weight?: string;

  @IsNotEmpty({ message: 'El Pelaje es obligatorio.' }) 
  @IsString({ message: 'Pelaje debe ser un texto.' })
  fur?: string;

  @IsNotEmpty({ message: 'El Sexo es obligatorio.' }) 
  @IsString({ message: 'Sexo debe ser un texto.' })
  sex?: string;

  @IsString()
  @IsString({ message: 'Edad debe ser un número.' })
  age?: string;

  @IsNotEmpty({ message: 'La Esterilización es obligatoria.' }) 
  @IsBoolean({ message: 'Esterilización debe ser verdadero o falso.' })
  sterilized?: boolean;

  @IsNotEmpty({ message: 'Se requiere la personalidad asociada.' })
  @IsString({ message: 'El ID de la personalidad debe ser un texto.' })
  personalityId: string;
}