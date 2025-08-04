import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException, Logger,
} from '@nestjs/common';
import {logRequest} from "../logging/logReuest";
import {EntityNotFoundError} from "typeorm";


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('HTTP');
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        let status = 500;
        let message: Object = 'Internal server error';

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
            userId: req.user?.id ?? 'anonymous',
            statusCode: status,
            startTime: req._startTime ?? process.hrtime.bigint(),
            error: exception instanceof Error ? exception : new Error(String(exception)),
        });

        res.status(status).json({
            statusCode: status,
            message
        });
    }
}