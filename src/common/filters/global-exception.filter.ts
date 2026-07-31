import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();

    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    const fallbackMessage =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    // Prefer Nest's response payload (`message` / string body) so clients get
    // the same human-readable text HttpException was created with.
    const message = this.resolveMessage(exceptionResponse, fallbackMessage);

    const stack =
      exception instanceof Error
        ? exception.stack
        : undefined;

    this.logger.error(
      Array.isArray(message) ? message.join(' ') : message,
      stack,
      'GlobalExceptionFilter',
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      error: exceptionResponse ?? fallbackMessage,
    });
  }

  private resolveMessage(
    exceptionResponse: string | object | null,
    fallback: string,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const nested = (exceptionResponse as { message?: unknown }).message;
      if (typeof nested === 'string' || Array.isArray(nested)) {
        return nested;
      }
    }

    return fallback;
  }
}