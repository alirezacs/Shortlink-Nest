import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../logger';
import { LoggingMiddleware } from './logging.middleware';

jest.mock('../logger/utils/request-id.util', () => ({
  generateRequestId: jest.fn(() => 'req-id-123'),
}));

describe('LoggingMiddleware', () => {
  let middleware: LoggingMiddleware;
  let logger: { http: jest.Mock };
  let req: Partial<Request>;
  let res: Partial<Response> & {
    setHeader: jest.Mock;
    on: jest.Mock;
    statusCode: number;
  };
  let next: jest.MockedFunction<NextFunction>;
  let finishHandler: (() => void) | undefined;

  beforeEach(() => {
    logger = { http: jest.fn() };
    middleware = new LoggingMiddleware(logger as unknown as LoggerService);

    finishHandler = undefined;
    req = {
      method: 'GET',
      originalUrl: '/api/links',
      headers: {},
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest-agent'),
    };
    res = {
      statusCode: 200,
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') {
          finishHandler = handler;
        }
        return res;
      }),
    };
    next = jest.fn();
  });

  it('calls next()', () => {
    middleware.use(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sets request id on request headers and response header', () => {
    middleware.use(req as Request, res as Response, next);

    expect(req.headers?.['x-request-id']).toBe('req-id-123');
    expect(res.setHeader).toHaveBeenCalledWith('x-request-id', 'req-id-123');
  });

  it('logs HTTP details when response finishes', () => {
    middleware.use(req as Request, res as Response, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(finishHandler).toBeDefined();

    finishHandler?.();

    expect(logger.http).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'HTTP',
        message: 'GET /api/links',
        method: 'GET',
        url: '/api/links',
        statusCode: 200,
        ip: '127.0.0.1',
        userAgent: 'jest-agent',
        requestId: 'req-id-123',
        duration: expect.any(Number),
      }),
    );
  });

  it('includes user id and email from request when present', () => {
    (req as any).user = { id: 'user-1', email: 'a@example.com' };

    middleware.use(req as Request, res as Response, next);
    finishHandler?.();

    expect(logger.http).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        userEmail: 'a@example.com',
      }),
    );
  });

  it('logs undefined user fields when the request is anonymous', () => {
    middleware.use(req as Request, res as Response, next);
    finishHandler?.();

    expect(logger.http).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: undefined,
        userEmail: undefined,
      }),
    );
  });
});
