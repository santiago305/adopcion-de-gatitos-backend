import { PartialType } from '@nestjs/mapped-types';
import { CreateEconomicStatusDto } from './create-economic_status.dto';

/**
 * DTO para actualizar el estado económico de un usuario.
 * 
 * Esta clase extiende de `CreateEconomicStatusDto` y convierte todos los campos
 * en opcionales, permitiendo actualizar parcialmente los datos del estado económico.
 * 
 * @class UpdateEconomicStatusDto
 * @extends PartialType(CreateEconomicStatusDto)
 */
export class UpdateEconomicStatusDto extends PartialType(CreateEconomicStatusDto) {}
