import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { LoggerService } from './common/logger';
import { configureApplication } from './common/configuration/configure-application';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await configureApplication(app);

  app.useLogger(
    app.get(WINSTON_MODULE_NEST_PROVIDER),
  );

  const logger = app.get(LoggerService);

  const port = process.env.PORT ?? 3002;

  await app.listen(port);

  logger.log(
    `Application started on port ${port}`,
    'Bootstrap',
  );
}

bootstrap();