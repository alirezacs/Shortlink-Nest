import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class loginDto {
    @ApiProperty({
        description: 'Address the account was registered with.',
        format: 'email',
        example: 'ada.lovelace@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Plain text password.',
        minLength: 8,
        format: 'password',
        example: 'S3cureP@ssw0rd',
    })
    @IsString()
    @MinLength(8)
    password: string;
}
