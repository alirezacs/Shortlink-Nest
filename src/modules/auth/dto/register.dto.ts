import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @ApiProperty({
        description: 'Given name of the account holder.',
        minLength: 1,
        maxLength: 100,
        example: 'Ada',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string;

    @ApiProperty({
        description: 'Family name of the account holder.',
        minLength: 1,
        maxLength: 100,
        example: 'Lovelace',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string;

    @ApiProperty({
        description: 'Login address. Must be unique across all accounts.',
        format: 'email',
        example: 'ada.lovelace@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Plain text password. Stored as a bcrypt hash.',
        minLength: 8,
        maxLength: 255,
        format: 'password',
        example: 'S3cureP@ssw0rd',
    })
    @IsString()
    @MinLength(8)
    @MaxLength(255)
    password: string;
}
