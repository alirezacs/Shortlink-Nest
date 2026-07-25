import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export const PERMISSION_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;

export type PermissionSortField = (typeof PERMISSION_SORT_FIELDS)[number];

const toOptionalBoolean = ({ value }: { value: unknown }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;

    return value;
};

export class QueryPermissionDto extends PaginationQueryDto {
    // Free text search across name and description.
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;

    // First segment of the permission name, for example `users`.
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    @IsOptional()
    @IsString()
    @MaxLength(100)
    group?: string;

    // true: only permissions attached to at least one role, false: only orphans.
    @Transform(toOptionalBoolean)
    @IsOptional()
    @IsBoolean()
    assigned?: boolean;

    @IsOptional()
    @IsIn(PERMISSION_SORT_FIELDS)
    sortBy: PermissionSortField = 'name';
}
