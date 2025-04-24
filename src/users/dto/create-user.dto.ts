import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO para la creación de un nuevo usuario.
 * Contiene las validaciones necesarias para asegurar la integridad de los datos.
 */
export class CreateUserDto {
  /**
   * Nombre del usuario.
   * Debe ser una cadena no vacía.
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Correo electrónico del usuario.
   * Debe ser un email válido.
   */
  @IsEmail()
  email: string;

  /**
   * Contraseña del usuario.
   * Debe ser una cadena no vacía. Se almacenará de forma encriptada.
   */
  @IsString()
  @IsNotEmpty()
  password: string;

  /**
   * ID del rol asignado al usuario.
   * No es obligatorio.
   */
  @IsOptional()
  @IsNotEmpty()
  roleId?: number;
}
