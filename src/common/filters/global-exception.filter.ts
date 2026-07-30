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

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    const stack =
      exception instanceof Error
        ? exception.stack
        : undefined;

    this.logger.error(
      message,
      stack,
      'GlobalExceptionFilter',
    );

    response.status(status).json({
      success: false,

      statusCode: status,

      path: request.url,

      timestamp: new Date().toISOString(),

      error: exceptionResponse ?? message,
    });
  }
}