import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

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

    new winston.transports.File({
      filename: path.join(
        logsDirectory,
        'application.log',
      ),
      level: 'info',
    }),

    new winston.transports.File({
      filename: path.join(
        logsDirectory,
        'error.log',
      ),
      level: 'error',
    }),
  ],
};