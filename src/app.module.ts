import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { appConfig, databaseConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionGuard } from './common/guards/permissions.guard';
import { SettingsModule } from './modules/settings/settings.module';
import { LinkModule } from './modules/link/link.module';
import { LinkService } from './modules/link/link.service';
import { LinkController } from './modules/link/link.controller';
import { LoggerModule } from './common/logger';

@Module({
  imports: [
    LoggerModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig]
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        uuidExtension: 'pgcrypto',
      })
    }),

    UserModule,

    RoleModule,

    PermissionModule,

    AuthModule,

    SettingsModule,

    LinkModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    },
    LinkService
  ],
  controllers: [LinkController]
})
export class AppModule {
  configure(
    consumer: MiddlewareConsumer,
  ): void {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*');
  }
}
