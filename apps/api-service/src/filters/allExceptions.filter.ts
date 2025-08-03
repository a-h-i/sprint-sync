import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException, Logger,
} from '@nestjs/common';
import {logRequest} from "../logging/logReuest";


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('HTTP');
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();

        const status =
            exception instanceof HttpException ? exception.getStatus() : 500;

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
            message:
                exception instanceof HttpException
                    ? exception.getResponse()
                    : 'Internal server error',
        });
    }
}