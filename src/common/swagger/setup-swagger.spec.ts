import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_DOCS_PATH } from '../constants/api.constants';
import { JWT_AUTH_SCHEME, setupSwagger } from './setup-swagger';

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');
  return {
    ...actual,
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({ openapi: '3.0.0' }),
      setup: jest.fn(),
    },
  };
});

describe('setupSwagger', () => {
  it('exports the JWT auth scheme name used by controllers', () => {
    expect(JWT_AUTH_SCHEME).toBe('JWT-auth');
  });

  it('builds the OpenAPI document and mounts Swagger UI', () => {
    const app = {} as INestApplication;
    const buildSpy = jest.spyOn(DocumentBuilder.prototype, 'build');

    setupSwagger(app);

    expect(buildSpy).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(
      app,
      expect.any(Object),
    );
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      API_DOCS_PATH,
      app,
      { openapi: '3.0.0' },
      expect.objectContaining({
        swaggerOptions: expect.objectContaining({
          persistAuthorization: true,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        }),
      }),
    );
  });
});
