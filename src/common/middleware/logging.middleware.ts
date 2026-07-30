import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

import { LoggerService } from '../logger';
import { generateRequestId } from '../logger/utils/request-id.util';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: LoggerService,
  ) {}

  use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const startedAt = Date.now();

    const requestId = generateRequestId();

    req.headers['x-request-id'] = requestId;

    res.setHeader(
      'x-request-id',
      requestId,
    );

    res.on('finish', () => {
      this.logger.http({
        context: 'HTTP',

        message: `${req.method} ${req.originalUrl}`,

        method: req.method,

        url: req.originalUrl,

        statusCode: res.statusCode,

        duration: Date.now() - startedAt,

        ip: req.ip,

        userAgent: req.get('user-agent'),

        requestId,

        userId: (req as any).user?.id,

        userEmail: (req as any).user?.email,
      });
    });

    next();
  }
}