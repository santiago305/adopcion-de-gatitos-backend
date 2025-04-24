// src/personality/dto/create-personality.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePersonalityDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}