import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logsDirectory = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, {
    recursive: true,
  });
}

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.NODE_ENV === 'production'
    ? 'info'
    : 'debug',

  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),

    winston.format.errors({
      stack: true,
    }),

    winston.format.splat(),

    nestWinstonModuleUtilities.format.nestLike(
      process.env.APP_NAME ?? 'Shortlink',
      {
        prettyPrint: true,
      },
    ),
  ),

  transports: [
    new winston.transports.Console(),

    new DailyRotateFile({
      level: 'info',

      dirname: logsDirectory,

      filename: 'application-%DATE%.log',

      datePattern: 'YYYY-MM-DD',

      zippedArchive: true,

      maxSize: '20m',

      maxFiles: '30d',
    }),

    new DailyRotateFile({
      level: 'error',

      dirname: logsDirectory,

      filename: 'error-%DATE%.log',

      datePattern: 'YYYY-MM-DD',

      zippedArchive: true,

      maxSize: '20m',

      maxFiles: '90d',
    }),
  ],
};