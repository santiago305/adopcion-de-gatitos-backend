import { IsOptional, IsString, IsBoolean, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCharacteristicsDto {
  @IsOptional() 
  @IsString({ message: 'Color debe ser un texto.' })
  color?: string;

  @IsOptional()
  @IsString({ message: 'Tamaño debe ser un texto.' })
  size?: string;

  @IsOptional() 
  @IsNumber({}, { message: 'Peso debe ser un número.' })
  weight?: number;

  @IsOptional() 
  @IsString({ message: 'Pelaje debe ser un texto.' })
  fur?: string;

  @IsOptional() 
  @IsString({ message: 'Sexo debe ser un texto.' })
  sex?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Edad debe ser un número.' })
  age?: number;

  @IsOptional() 
  @IsBoolean({ message: 'Esterilización debe ser verdadero o falso.' })
  sterilized?: boolean;

  @IsNotEmpty({ message: 'Se requiere la personalidad asociada.' })
  personalityId: number;
}