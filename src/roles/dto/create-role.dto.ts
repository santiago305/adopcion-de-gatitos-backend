import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    description: string;
}
