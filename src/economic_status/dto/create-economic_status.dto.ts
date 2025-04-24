import {
IsNotEmpty, 
IsString 
} from 'class-validator';

/**
 * DTO para la creación de un estado económico.
 * 
 * Esta clase define el formato y las validaciones necesarias para crear un estado
 * económico. Utiliza los decoradores de `class-validator` para asegurarse de que el 
 * campo `level` sea una cadena no vacía.
 * 
 * @class CreateEconomicStatusDto
 */
export class CreateEconomicStatusDto {

  /**
   * Nivel del estado económico.
   * 
   * Este campo es obligatorio y debe ser una cadena no vacía.
   * Se valida con `@IsString` para asegurarse de que el valor sea una cadena
   * de caracteres y `@IsNotEmpty` para garantizar que no esté vacío.
   * 
   * @property {string} level - Nivel económico del usuario.
   */
  @IsString()
  @IsNotEmpty()
  level: string;
}
