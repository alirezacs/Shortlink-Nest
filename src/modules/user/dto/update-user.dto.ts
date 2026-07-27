import { ApiPropertyOptional } from "@nestjs/swagger";
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
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "./create-user.dto";

// Every field is optional: an omitted field keeps its stored value.
export class UpdateUserDto {
    @ApiPropertyOptional({
        description: 'New given name. Omit to keep the stored one.',
        minLength: 1,
        maxLength: 100,
        example: 'Ada',
    })
    @Transform(trimValue)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName?: string;

    @ApiPropertyOptional({
        description: 'New family name. Omit to keep the stored one.',
        minLength: 1,
        maxLength: 100,
        example: 'Lovelace',
    })
    @Transform(trimValue)
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName?: string;

    @ApiPropertyOptional({
        description:
            'New login address, unique across all accounts. Omit to keep the stored one.',
        format: 'email',
        maxLength: 255,
        example: 'ada.lovelace@example.com',
    })
    @Transform(normalizeEmail)
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiPropertyOptional({
        description:
            'New plain text password. Omit to keep the stored hash: a blank value is rejected rather than read as "no password".',
        minLength: PASSWORD_MIN_LENGTH,
        maxLength: PASSWORD_MAX_LENGTH,
        format: 'password',
        example: 'S3cureP@ssw0rd',
    })
    @IsOptional()
    @IsString()
    @MinLength(PASSWORD_MIN_LENGTH)
    @MaxLength(PASSWORD_MAX_LENGTH)
    password?: string;

    @ApiPropertyOptional({
        description: 'Omit to keep the stored status.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description:
            'true stamps `emailVerifiedAt` with the current time if the address was still unverified, false clears it. Omit to keep the stored value.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional({
        description:
            'Replaces the whole role set. Omit to keep the stored one, send an empty array to revoke every role.',
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
