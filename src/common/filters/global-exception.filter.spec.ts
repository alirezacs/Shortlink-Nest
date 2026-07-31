import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { LoggerService } from '../logger';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logger: { error: jest.Mock };
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;

  beforeEach(() => {
    logger = { error: jest.fn() };
    filter = new GlobalExceptionFilter(logger as unknown as LoggerService);

    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });

    host = {
      switchToHttp: () => ({
        getRequest: () => ({ url: '/api/test' }),
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
  });

  it('handles HttpException with string response', () => {
    const exception = new HttpException('Gone', HttpStatus.GONE);

    filter.catch(exception, host);

    expect(logger.error).toHaveBeenCalledWith(
      'Gone',
      expect.any(String),
      'GlobalExceptionFilter',
    );
    expect(status).toHaveBeenCalledWith(HttpStatus.GONE);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.GONE,
        path: '/api/test',
        message: 'Gone',
        error: 'Gone',
        timestamp: expect.any(String),
      }),
    );
  });

  it('handles HttpException with object message string', () => {
    const exception = new NotFoundException('Item not found');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.NOT_FOUND,
        path: '/api/test',
        message: 'Item not found',
        error: expect.objectContaining({
          message: 'Item not found',
        }),
        timestamp: expect.any(String),
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Item not found',
      expect.any(String),
      'GlobalExceptionFilter',
    );
  });

  it('handles HttpException with object message array', () => {
    const exception = new BadRequestException(['name must be a string', 'email is required']);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        path: '/api/test',
        message: ['name must be a string', 'email is required'],
        timestamp: expect.any(String),
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'name must be a string email is required',
      expect.any(String),
      'GlobalExceptionFilter',
    );
  });

  it('maps non-HttpException to 500 Internal Server Error', () => {
    const exception = new Error('boom');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        path: '/api/test',
        message: 'Internal Server Error',
        error: 'Internal Server Error',
        timestamp: expect.any(String),
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Internal Server Error',
      expect.any(String),
      'GlobalExceptionFilter',
    );
  });

  it('handles non-Error throws without a stack trace', () => {
    filter.catch('fatal', host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(logger.error).toHaveBeenCalledWith(
      'Internal Server Error',
      undefined,
      'GlobalExceptionFilter',
    );
  });

  it('falls back to exception.message when response object has no message', () => {
    const exception = new HttpException(
      { statusCode: 418, error: 'Teapot' },
      HttpStatus.I_AM_A_TEAPOT,
    );

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.I_AM_A_TEAPOT,
        message: exception.message,
      }),
    );
  });

  it('returns response shape with success, statusCode, path, timestamp, message, error', () => {
    filter.catch(new NotFoundException('missing'), host);

    const body = json.mock.calls[0][0];

    expect(Object.keys(body).sort()).toEqual(
      [
        'error',
        'message',
        'path',
        'statusCode',
        'success',
        'timestamp',
      ].sort(),
    );
    expect(body.success).toBe(false);
    expect(typeof body.timestamp).toBe('string');
  });
});
