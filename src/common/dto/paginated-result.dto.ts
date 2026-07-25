export class PaginationMetaDto {
    total: number;

    page: number;

    limit: number;

    totalPages: number;

    hasPreviousPage: boolean;

    hasNextPage: boolean;
}

export class PaginatedResultDto<T> {
    data: T[];

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
