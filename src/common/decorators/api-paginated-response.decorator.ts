import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResultDto } from '../dto/paginated-result.dto';

/**
 * Documents a `PaginatedResultDto<T>` response.
 *
 * TypeScript generics are erased at runtime, so `@ApiOkResponse({ type:
 * PaginatedResultDto })` alone would emit a page whose `data` is untyped. The
 * official workaround is to compose the envelope and the item schema with
 * `allOf`, which is what this decorator does for every list endpoint.
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(
    model: TModel,
    description?: string,
) =>
    applyDecorators(
        // Neither model is reachable from a handler signature, so both have to be
        // registered explicitly for `getSchemaPath` to resolve.
        ApiExtraModels(PaginatedResultDto, model),
        ApiOkResponse({
            description,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatedResultDto) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
