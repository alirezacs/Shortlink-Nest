import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import {
    normalizeIdentifier,
    toOptionalBoolean,
    trimValue,
} from "../../../common/dto/transformers";

export const PERMISSION_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;

export type PermissionSortField = (typeof PERMISSION_SORT_FIELDS)[number];

export class QueryPermissionDto extends PaginationQueryDto {
    // Free text search across name and description.
    @ApiPropertyOptional({
        description: 'Case insensitive substring match on name and description.',
        maxLength: 100,
        example: 'users',
    })
    @Transform(trimValue)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    // First segment of the permission name, for example `users`.
    @ApiPropertyOptional({
        description:
            'Restrict to one group. Matches the group itself and everything below it, so `users` returns `users` and `users.read`.',
        maxLength: 100,
        example: 'users',
    })
    @Transform(normalizeIdentifier)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    group?: string;

    // true: only permissions attached to at least one role, false: only orphans.
    @ApiPropertyOptional({
        description:
            'true returns only permissions attached to at least one role, false returns only orphans. Omit for both. Accepts `true`/`false` and `1`/`0`.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    assigned?: boolean;

    @ApiPropertyOptional({
        description: 'Column to sort on. Ties are broken by name.',
        enum: [...PERMISSION_SORT_FIELDS],
        enumName: 'PermissionSortField',
        default: 'name',
    })
    @IsOptional()
    @IsIn(PERMISSION_SORT_FIELDS)
    sortBy: PermissionSortField = 'name';
}
