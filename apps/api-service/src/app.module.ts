import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from "@nestjs/config";
import {getPgConfig} from "@sprint-sync/storage";
import {AuthModule} from "./auth/auth.module";
import {ProfileModule} from "./profile/profile.module";
import {TaskModule} from "./task/task.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            cache: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [],
            inject: [],
            useFactory: () => {
                return getPgConfig(true);
            },
        }),
        AuthModule,
        ProfileModule,
        TaskModule
    ],
})
export class AppModule {
}
