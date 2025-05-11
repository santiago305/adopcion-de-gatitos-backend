import {
  IsPhoneNumber,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateClientDto {
  /**
   * Número de teléfono válido.
   */
  @IsPhoneNumber(null) // Puedes pasar el código de país como 'PE' si quieres restringir a Perú, por ejemplo.
  phone: string;

  /**
   * Fecha de nacimiento válida (transformada desde string a Date).
   */
  @Type(() => Date)
  @IsDate()
  birth_date: Date;

  /**
   * Género del cliente (solo valores del enum).
   */
  @IsEnum(Gender)
  gender: Gender;
}
