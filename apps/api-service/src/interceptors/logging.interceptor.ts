import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from "@nestjs/common";
import {Observable, tap} from "rxjs";
import {logRequest} from "../logging/logReuest";


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = process.hrtime.bigint(); // nanoseconds
        const request = context.switchToHttp().getRequest();
        request['_startTime']  = start;
        const response = context.switchToHttp().getResponse();
        const { method, originalUrl, user } = request;

        return next.handle()
            .pipe(
                tap(() => {
                    logRequest(this.logger, {
                        method,
                        path: originalUrl,
                        userId: user?.id ?? 'anonymous',
                        statusCode: response.statusCode,
                        startTime: request['_startTime'],
                    })
                })
            )

    }
}