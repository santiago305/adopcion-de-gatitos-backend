import { IsEmail, IsString, IsStrongPassword } from 'class-validator';


export class LoginAuthDto {

  @IsString()
  @IsEmail()
  email:string;


  @IsString()
  @IsStrongPassword()
  password: string;


}