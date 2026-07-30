import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { LoggerService } from '../logger';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { setupSwagger } from '../swagger/setup-swagger';
import {
  API_PREFIX,
  API_VERSION_1,
} from '../constants/api.constants';

import { VersioningType } from '@nestjs/common';

export async function configureApplication(
  app: INestApplication,
): Promise<void> {

  const logger = app.get(LoggerService);

  app.useGlobalFilters(
    new GlobalExceptionFilter(logger),
  );

  app.setGlobalPrefix(API_PREFIX);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION_1,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (
    app
      .get(ConfigService)
      .get<string>('app.nodeEnv') === 'development'
  ) {
    setupSwagger(app);
  }
}