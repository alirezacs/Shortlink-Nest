import { IsEmail, IsNotEmpty, IsString, Max, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password: string;
}