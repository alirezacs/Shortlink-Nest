import {
  Inject,
  Injectable,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { LogEntry } from './interfaces/log-entry.interface';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  log(message: unknown, context?: string): void {
    this.logger.info(String(message), {
      context,
    });
  }

  error(
    message: unknown,
    trace?: string,
    context?: string,
  ): void {
    this.logger.error(String(message), {
      context,
      trace,
    });
  }

  warn(message: unknown, context?: string): void {
    this.logger.warn(String(message), {
      context,
    });
  }

  debug(message: unknown, context?: string): void {
    this.logger.debug(String(message), {
      context,
    });
  }

  verbose(message: unknown, context?: string): void {
    this.logger.verbose(String(message), {
      context,
    });
  }

  http(entry: LogEntry): void {
    this.logger.info(entry.message, {
      context: entry.context,

      method: entry.method,

      url: entry.url,

      statusCode: entry.statusCode,

      duration: entry.duration,

      ip: entry.ip,

      userAgent: entry.userAgent,

      requestId: entry.requestId,

      userId: entry.userId,

      userEmail: entry.userEmail,

      meta: entry.meta,
    });
  }
}