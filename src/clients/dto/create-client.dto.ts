import { IsString, IsOptional, IsPhoneNumber, IsInt } from 'class-validator';

/**
 * DTO para crear un nuevo cliente.
 * 
 * Esta clase define los datos que se requieren para crear un nuevo cliente en el sistema.
 * Se valida la dirección, el teléfono (que debe ser un número válido según el país) y el estado económico
 * del cliente. El estado económico es opcional.
 */
export class CreateClientDto {
  
  /**
   * Dirección del cliente.
   * 
   * La dirección es una cadena de texto que representa la ubicación física del cliente.
   * 
   * @example "123 Calle Ficticia, Lima, Perú"
   */
  @IsString()
  address: string;

  /**
   * Teléfono del cliente.
   * 
   * El número telefónico debe ser válido según el país especificado en el decorador `@IsPhoneNumber`.
   * En este caso, está validado para Perú ('PE'), pero se puede modificar para otros países.
   * 
   * @example "+51 912 345 678"
   */
  @IsPhoneNumber('PE') // O el país que prefieras
  phone: string;

  /**
   * ID del estado económico del cliente (opcional).
   * 
   * Este campo es opcional y representa el estado económico que se asignará al cliente al momento de su creación.
   * El valor debe ser un número entero que corresponde a un estado económico válido en la base de datos.
   * 
   * @example 1
   * 
   * @optional
   */
  @IsOptional()
  @IsInt()
  economicStatusId?: number;
}
