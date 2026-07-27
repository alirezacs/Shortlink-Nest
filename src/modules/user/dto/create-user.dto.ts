import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from "class-validator";
import {
    normalizeEmail,
    toOptionalBoolean,
    trimValue,
} from "../../../common/dto/transformers";

// Matches the minimum the registration endpoint enforces, so an account created
// from the dashboard is never weaker than one created by its owner.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 255;

export class CreateUserDto {
    @ApiProperty({
        description: 'Given name of the account holder. Trimmed before validation.',
        minLength: 1,
        maxLength: 100,
        example: 'Ada',
    })
    @Transform(trimValue)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string;

    @ApiProperty({
        description: 'Family name of the account holder. Trimmed before validation.',
        minLength: 1,
        maxLength: 100,
        example: 'Lovelace',
    })
    @Transform(trimValue)
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string;

    @ApiProperty({
        description:
            'Login address, unique across all accounts. Trimmed and lower cased before validation.',
        format: 'email',
        maxLength: 255,
        example: 'ada.lovelace@example.com',
    })
    @Transform(normalizeEmail)
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        description: 'Plain text password. Stored as a bcrypt hash, never returned.',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
        format: 'password',
        example: 'S3cureP@ssw0rd',
    })
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password: string;

    @ApiPropertyOptional({
        description:
            'Deactivated accounts keep their rows and assignments. Defaults to true.',
        type: Boolean,
        default: true,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description:
            'true stamps `emailVerifiedAt` with the current time, false leaves the address unverified. Defaults to false.',
        type: Boolean,
        default: false,
        example: false,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional({
        description:
            'Roles held by this account. Omit or send an empty array to create an account without any permission.',
        type: [String],
        format: 'uuid',
        example: ['3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsUUID('all', { each: true })
    roleIds?: string[];
}
