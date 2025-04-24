import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para crear una nueva especie.
 */
export class CreateSpeciesDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
