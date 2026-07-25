import { ApiPropertyOptional } from "@nestjs/swagger";
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
import { ROLE_NAME_PATTERN } from "./create-role.dto";

// Every field is optional: an omitted field keeps its stored value, while
// `description: null` (or an empty string) clears the stored description.
export class UpdateRoleDto {
    @ApiPropertyOptional({
        description: 'New identifier. Omit to keep the stored one.',
        minLength: 3,
        maxLength: 100,
        pattern: ROLE_NAME_PATTERN.source,
        example: 'content_editor',
    })
    @Transform(normalizeIdentifier)
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @Matches(ROLE_NAME_PATTERN, {
        message:
            'name must be lower case, without spaces or dots (for example: content_editor)',
    })
    name?: string;

    @ApiPropertyOptional({
        description:
            'Omit to keep the stored description. Send null or a blank string to clear it.',
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
            'Replaces the whole permission set. Omit to keep the stored one, send an empty array to revoke every permission.',
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
