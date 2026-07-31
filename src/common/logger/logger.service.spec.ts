import { Logger } from 'winston';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let winston: {
    info: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
    debug: jest.Mock;
    verbose: jest.Mock;
  };
  let service: LoggerService;

  beforeEach(() => {
    winston = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };
    service = new LoggerService(winston as unknown as Logger);
  });

  it('log forwards to winston.info', () => {
    service.log('hello', 'Ctx');

    expect(winston.info).toHaveBeenCalledWith('hello', { context: 'Ctx' });
  });

  it('error forwards message, trace, and context', () => {
    service.error('boom', 'stack-trace', 'Ctx');

    expect(winston.error).toHaveBeenCalledWith('boom', {
      context: 'Ctx',
      trace: 'stack-trace',
    });
  });

  it('warn forwards to winston.warn', () => {
    service.warn('careful', 'Ctx');

    expect(winston.warn).toHaveBeenCalledWith('careful', { context: 'Ctx' });
  });

  it('debug forwards to winston.debug', () => {
    service.debug('detail', 'Ctx');

    expect(winston.debug).toHaveBeenCalledWith('detail', { context: 'Ctx' });
  });

  it('verbose forwards to winston.verbose', () => {
    service.verbose('noise', 'Ctx');

    expect(winston.verbose).toHaveBeenCalledWith('noise', { context: 'Ctx' });
  });

  it('http forwards structured entry fields to winston.info', () => {
    service.http({
      context: 'HTTP',
      message: 'GET /',
      method: 'GET',
      url: '/',
      statusCode: 200,
      duration: 12,
      ip: '127.0.0.1',
      userAgent: 'jest',
      requestId: 'rid',
      userId: 'u1',
      userEmail: 'a@b.c',
      meta: { a: 1 },
    });

    expect(winston.info).toHaveBeenCalledWith('GET /', {
      context: 'HTTP',
      method: 'GET',
      url: '/',
      statusCode: 200,
      duration: 12,
      ip: '127.0.0.1',
      userAgent: 'jest',
      requestId: 'rid',
      userId: 'u1',
      userEmail: 'a@b.c',
      meta: { a: 1 },
    });
  });
});
