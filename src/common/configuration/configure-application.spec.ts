import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configureApplication } from './configure-application';
import { LoggerService } from '../logger';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import * as swagger from '../swagger/setup-swagger';
import { API_PREFIX, API_VERSION_1 } from '../constants/api.constants';

describe('configureApplication', () => {
  function createAppMock(nodeEnv: string | undefined) {
    return {
      get: jest.fn((token: unknown) => {
        if (token === LoggerService) {
          return { error: jest.fn() };
        }
        if (token === ConfigService) {
          return {
            get: jest.fn().mockReturnValue(nodeEnv),
          };
        }
        return undefined;
      }),
      useGlobalFilters: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableVersioning: jest.fn(),
      useGlobalPipes: jest.fn(),
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers filter, prefix, versioning and validation pipe', async () => {
    const app = createAppMock('production');
    const setupSwaggerSpy = jest.spyOn(swagger, 'setupSwagger').mockImplementation();

    await configureApplication(app as unknown as INestApplication);

    expect(app.useGlobalFilters).toHaveBeenCalledWith(
      expect.any(GlobalExceptionFilter),
    );
    expect(app.setGlobalPrefix).toHaveBeenCalledWith(API_PREFIX);
    expect(app.enableVersioning).toHaveBeenCalledWith({
      type: VersioningType.URI,
      defaultVersion: API_VERSION_1,
    });
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(setupSwaggerSpy).not.toHaveBeenCalled();
  });

  it('sets up Swagger when app.nodeEnv is development', async () => {
    const app = createAppMock('development');
    const setupSwaggerSpy = jest.spyOn(swagger, 'setupSwagger').mockImplementation();

    await configureApplication(app as unknown as INestApplication);

    expect(setupSwaggerSpy).toHaveBeenCalledWith(app);
  });
});
