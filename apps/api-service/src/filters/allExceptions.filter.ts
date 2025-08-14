import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { logRequest } from '../logging/logReuest';
import { EntityNotFoundError } from 'typeorm';
import { Request, Response } from 'express';
import { User } from '@sprint-sync/storage';
import * as process from 'node:process';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req: Request = ctx.getRequest();
    const res: Response = ctx.getResponse();

    let status = 500;
    let message: object | string = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof EntityNotFoundError) {
      status = 404;
      message = 'Not found';
    }

    logRequest(this.logger, {
      method: req.method,
      path: req.originalUrl,
      userId: (req['user'] as User)?.id ?? 'anonymous',
      statusCode: status,
      startTime: (req['_startTime'] as bigint) ?? process.hrtime.bigint(),
      error:
        exception instanceof Error ? exception : new Error(String(exception)),
      cwd: process.cwd()
    });

    res.status(status).json({
      statusCode: status,
      message,
    });
  }
}
