import {ConsoleLogger, INestApplication, ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {LoggingInterceptor} from "./interceptors/logging.interceptor";
import {AllExceptionsFilter} from "./filters/allExceptions.filter";

export function setupApplication(app: INestApplication) {
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
            enableImplicitConversion: true,
        }
    }));
    app.useLogger(new ConsoleLogger({
        json: true,

    }));
    app.useGlobalInterceptors(new LoggingInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Sprint Sync API')
        .setDescription('Backend API for Sprint Sync')
        .setVersion('0.1')
        .addTag('sprint-sync')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, documentFactory, {
        jsonDocumentUrl: 'swagger/json'
    });
}