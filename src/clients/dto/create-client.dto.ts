import { IsString, IsOptional, IsPhoneNumber, IsInt } from 'class-validator';

export class CreateClientDto {
  @IsString()
  address: string;

  @IsPhoneNumber('PE') // O el país que prefieras
  phone: string;

  @IsOptional()
  @IsInt()
  economicStatusId?: number;
}
