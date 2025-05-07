import { 
  IsString, 
  IsNotEmpty, 
  Matches, 
  Length
} from 'class-validator';

/**
 * DTO (Data Transfer Object) para la creación de un nuevo rol.
 *
 * Este objeto define y valida los datos que se esperan al momento de
 * recibir una solicitud para crear un rol.
 */
export class CreateRoleDto {
  /**
   * Descripción del rol (por ejemplo: "admin", "user").
   *
   * @type {string}
   * @validation
   * - Debe ser una cadena (`string`).
   * - No puede estar vacía.
   */
  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'La descripción solo debe contener letras y espacios',
  })
  @Length(3, 30, {
    message: 'La descripción debe tener entre 3 y 30 caracteres',
  })
  description: string;
  
}
