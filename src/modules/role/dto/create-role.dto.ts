import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    ArrayUnique,
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MaxLength,
    MinLength,
} from "class-validator";
import {
    normalizeDescription,
    normalizeIdentifier,
    toOptionalBoolean,
} from "../../../common/dto/transformers";

// Roles are single segment, lower case identifiers: `admin`, `content_editor`.
// Unlike permissions they are not namespaced, so no dots are allowed.
export const ROLE_NAME_PATTERN = /^[a-z][a-z0-9_-]*$/;

export class CreateRoleDto {
    @ApiProperty({
        description:
            'Unique, lower case identifier. Trimmed and lower cased before validation.',
        minLength: 3,
        maxLength: 100,
        pattern: ROLE_NAME_PATTERN.source,
        example: 'content_editor',
    })
    @Transform(normalizeIdentifier)
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @Matches(ROLE_NAME_PATTERN, {
        message:
            'name must be lower case, without spaces or dots (for example: content_editor)',
    })
    name: string;

    @ApiPropertyOptional({
        description:
            'Free text explanation. A blank string is stored as null, meaning "no description".',
        maxLength: 255,
        nullable: true,
        example: 'Publishes and edits content',
    })
    @Transform(normalizeDescription)
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string | null;

    @ApiPropertyOptional({
        description:
            'Inactive roles stay assignable but are meant to be filtered out of pickers. Defaults to true.',
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
            'Permissions granted by this role. Omit or send an empty array to create a role without permissions.',
        type: [String],
        format: 'uuid',
        example: ['3f2504e0-4f89-11d3-9a0c-0305e82c3301'],
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsUUID('all', { each: true })
    permissionIds?: string[];
}
