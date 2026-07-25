import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { API_PREFIX, API_VERSION_1 } from './common/constants/api.constants';
import { setupSwagger } from './common/swagger/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
