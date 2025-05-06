import { IsString, IsNotEmpty } from 'class-validator';

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
  @IsNotEmpty()
  description: string;
}
