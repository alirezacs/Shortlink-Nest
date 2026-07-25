import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min } from "class-validator";

export const SORT_ORDERS = ['ASC', 'DESC'] as const;

export type SortOrder = (typeof SORT_ORDERS)[number];

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export class PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'One based page number.',
        minimum: 1,
        default: DEFAULT_PAGE,
        example: DEFAULT_PAGE,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = DEFAULT_PAGE;

    @ApiPropertyOptional({
        description: `Rows per page. Capped at ${MAX_LIMIT}.`,
        minimum: 1,
        maximum: MAX_LIMIT,
        default: DEFAULT_LIMIT,
        example: DEFAULT_LIMIT,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(MAX_LIMIT)
    limit: number = DEFAULT_LIMIT;

    @ApiPropertyOptional({
        description: 'Sort direction. Accepted case insensitively.',
        enum: [...SORT_ORDERS],
        enumName: 'SortOrder',
        default: 'ASC',
    })
    @IsOptional()
    @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
    @IsIn(SORT_ORDERS)
    sortOrder: SortOrder = 'ASC';

    // Offset for the current page. Derived so callers never recompute it.
    // Left undecorated on purpose: it is not an accepted query parameter.
    get skip(): number {
        return (this.page - 1) * this.limit;
    }
}
