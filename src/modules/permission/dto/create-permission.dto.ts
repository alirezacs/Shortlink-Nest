import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import {
    normalizeDescription,
    normalizeIdentifier,
} from "../../../common/dto/transformers";

// Permissions are dot separated, lower case identifiers: `users`, `users.read`.
// The first segment is treated as the permission group.
export const PERMISSION_NAME_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)*$/;

export class CreatePermissionDto {
    @ApiProperty({
        description:
            'Unique, dot separated identifier. Trimmed and lower cased before validation. The first segment becomes the permission group.',
        minLength: 3,
        maxLength: 100,
        pattern: PERMISSION_NAME_PATTERN.source,
        example: 'users.read',
    })
    @Transform(normalizeIdentifier)
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @Matches(PERMISSION_NAME_PATTERN, {
        message: 'name must be lower case, dot separated (for example: users.read)',
    })
    name: string;

    @ApiPropertyOptional({
        description:
            'Free text explanation. A blank string is stored as null, meaning "no description".',
        maxLength: 255,
        nullable: true,
        example: 'Read the user directory',
    })
    @Transform(normalizeDescription)
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string | null;
}
