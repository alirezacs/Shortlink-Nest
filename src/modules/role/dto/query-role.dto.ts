import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";
import { toOptionalBoolean, trimValue } from "../../../common/dto/transformers";

export const ROLE_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;

export type RoleSortField = (typeof ROLE_SORT_FIELDS)[number];

export class QueryRoleDto extends PaginationQueryDto {
    // Free text search across name and description.
    @ApiPropertyOptional({
        description: 'Case insensitive substring match on name and description.',
        maxLength: 100,
        example: 'admin',
    })
    @Transform(trimValue)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    // true: only active roles, false: only deactivated ones.
    @ApiPropertyOptional({
        description:
            'true returns only active roles, false only deactivated ones. Omit for both. Accepts `true`/`false` and `1`/`0`.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    // true: only roles held by at least one user, false: only unused ones.
    @ApiPropertyOptional({
        description:
            'true returns only roles assigned to at least one user, false returns only unused roles. Omit for both.',
        type: Boolean,
        example: true,
    })
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    assigned?: boolean;

    @ApiPropertyOptional({
        description: 'Column to sort on. Ties are broken by name.',
        enum: [...ROLE_SORT_FIELDS],
        enumName: 'RoleSortField',
        default: 'name',
    })
    @IsOptional()
    @IsIn(ROLE_SORT_FIELDS)
    sortBy: RoleSortField = 'name';
}
