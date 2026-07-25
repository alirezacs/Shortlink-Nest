import { Transform } from "class-transformer";
import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import {
    normalizeDescription,
    normalizePermissionName,
    PERMISSION_NAME_PATTERN,
} from "./create-permission.dto";

// Every field is optional: an omitted field keeps its stored value, while
// `description: null` (or an empty string) clears the stored description.
export class UpdatePermissionDto {
    @Transform(normalizePermissionName)
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    @Matches(PERMISSION_NAME_PATTERN, {
        message: 'name must be lower case, dot separated (for example: users.read)',
    })
    name?: string;

    @Transform(normalizeDescription)
    @IsOptional()
    @IsString()
    @MaxLength(255)
    description?: string | null;
}
