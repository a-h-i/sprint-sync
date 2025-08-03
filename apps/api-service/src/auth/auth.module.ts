import {Module} from "@nestjs/common";
import {LoginService} from "./login.service";
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AuthController} from "./auth.controller";


@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET');
                return {
                    secret,
                    global: true,
                    signOptions: {
                        algorithm: 'HS512',
                        expiresIn: '2h'
                    }
                }
            }
        })
    ],
    providers: [
        LoginService,
    ],
    controllers: [AuthController],
    exports: [LoginService]
})
export class AuthModule {
}