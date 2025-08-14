import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logRequest } from '../logging/logReuest';
import { User } from '@sprint-sync/storage';
import { Request, Response } from 'express';
import * as process from 'node:process';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = process.hrtime.bigint(); // nanoseconds
    const request: Request = context.switchToHttp().getRequest();
    request['_startTime'] = start;
    const response: Response = context.switchToHttp().getResponse();
    const { method, originalUrl } = request;

    return next.handle().pipe(
      tap(() => {
        logRequest(this.logger, {
          method,
          path: originalUrl,
          userId: (request['user'] as User)?.id ?? 'anonymous',
          statusCode: response.statusCode,
          startTime: request['_startTime'] as bigint,
          cwd: process.cwd(),
        });
      }),
    );
  }
}
