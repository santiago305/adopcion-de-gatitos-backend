import { IsNotEmpty, IsString } from "class-validator";

export class CreateEconomicStatusDto {

    @IsString()
    @IsNotEmpty()
    level: string;
    
}
