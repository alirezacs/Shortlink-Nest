import { ApiProperty } from "@nestjs/swagger";

export class PaginationMetaDto {
    @ApiProperty({
        description: 'Total rows matching the filters, across every page.',
        example: 42,
    })
    total: number;

    @ApiProperty({
        description: 'Page that produced this response.',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Page size that produced this response.',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Number of pages available for the current page size.',
        example: 5,
    })
    totalPages: number;

    @ApiProperty({ example: false })
    hasPreviousPage: boolean;

    @ApiProperty({ example: true })
    hasNextPage: boolean;
}

export class PaginatedResultDto<T> {
    // `data` is intentionally left undocumented here: `T` does not survive
    // compilation. Each list endpoint supplies the item schema through
    // `@ApiPaginatedResponse(Model)`.
    data: T[];

    @ApiProperty({ type: PaginationMetaDto })
    meta: PaginationMetaDto;
}

// Wraps a page of rows with the metadata every paginated list endpoint returns.
export function paginate<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
): PaginatedResultDto<T> {
    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasPreviousPage: page > 1,
            hasNextPage: page < totalPages,
        },
    };
}
