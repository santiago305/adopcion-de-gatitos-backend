import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCharacteristicDto {
  @IsOptional()
  @IsString({ message: 'Color debe ser un texto.' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Tamaño debe ser un texto.' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'Peso debe ser un número.' })
  weight?: string;

  @IsOptional()
  @IsString({ message: 'Pelaje debe ser un texto.' })
  fur?: string;

  @IsOptional()
  @IsString({ message: 'Sexo debe ser un texto.' })
  sex?: string;

  @IsOptional()
  @IsString({ message: 'Edad debe ser un número.' })
  age?: string;

  @IsOptional()
  @IsBoolean({ message: 'Esterilización debe ser verdadero o falso.' })
  sterilized?: boolean;

  @IsOptional()
  @IsString({ message: 'El ID de la personalidad debe ser un texto.' })
  personalityId?: string;
}
