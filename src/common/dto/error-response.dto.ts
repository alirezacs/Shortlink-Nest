import { ApiProperty } from '@nestjs/swagger';

/**
 * Shape produced by Nest's built-in exception filter for `HttpException`s.
 *
 * Documented once here so every controller can reference the same schema
 * instead of inlining an anonymous error object per operation.
 */
export class ErrorResponseDto {
    @ApiProperty({
        description: 'HTTP status code, repeated in the body.',
        example: 404,
    })
    statusCode: number;

    @ApiProperty({
        description: 'Human readable explanation of the failure.',
        example: 'Permission with id "0f1c3b2a-..." was not found',
    })
    message: string;

    @ApiProperty({
        description: 'Reason phrase of the status code.',
        example: 'Not Found',
    })
    error: string;
}

/**
 * Validation failures differ from the generic shape: the global `ValidationPipe`
 * reports `message` as one entry per broken constraint.
 */
export class ValidationErrorResponseDto {
    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({
        description: 'One entry per failed validation constraint.',
        type: [String],
        example: [
            'email must be an email',
            'password must be longer than or equal to 8 characters',
        ],
    })
    message: string[];

    @ApiProperty({ example: 'Bad Request' })
    error: string;
}
