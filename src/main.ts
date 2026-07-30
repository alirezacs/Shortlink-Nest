import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { API_PREFIX, API_VERSION_1 } from './common/constants/api.constants';
import { setupSwagger } from './common/swagger/setup-swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from '@nestjs/common';
import { LoggerService } from './common/logger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(
    app.get(WINSTON_MODULE_NEST_PROVIDER)
  )

  const logger = app.get(LoggerService);

  app.useGlobalFilters(
    new GlobalExceptionFilter(logger),
  );

  // Routes resolve as /<prefix>/v<version>/<controller path>, e.g. /api/v1/auth/login.
  app.setGlobalPrefix(API_PREFIX);

  // Controllers already pin their own version. `defaultVersion` only covers
  // controllers added later that forget to, so an unversioned route can never
  // leak outside /api/v1.
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION_1,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Development only: the OpenAPI document describes the whole private surface
  // of the API, so it must never be reachable from a production deployment.
  if (app.get(ConfigService).get<string>('app.nodeEnv') === 'development') {
    setupSwagger(app);
  }

  logger.log(
    `Application started on port ${process.env.PORT ?? 3002}`,
  );

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
