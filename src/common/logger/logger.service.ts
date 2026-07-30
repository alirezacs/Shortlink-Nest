import { Inject, Injectable } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  log(message: string, meta?: unknown): void {
    this.logger.info(message, meta);
  }

  error(
    message: string,
    trace?: unknown,
    meta?: unknown,
  ): void {
    this.logger.error(message, {
      trace,
      ...((meta as object) || {}),
    });
  }

  warn(message: string, meta?: unknown): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: unknown): void {
    this.logger.verbose(message, meta);
  }

  logWithContext(
    context: string,
    message: string,
    meta?: unknown
  ): void{
    this.logger.info(message, {
      context,
      ...((meta as object) || {}),
    })
  }
}