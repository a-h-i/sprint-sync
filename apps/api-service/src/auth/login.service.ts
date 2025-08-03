import {Injectable, UnauthorizedException} from "@nestjs/common";
import {DataSource} from "typeorm";
import {login} from "@sprint-sync/control";
import {JwtService} from "@nestjs/jwt";
import {User} from "@sprint-sync/storage";


@Injectable()
export class LoginService {
    constructor(private source: DataSource, private jwtService: JwtService) {}

    async signIn(username: string, password: string) {
        const user = await login(this.source.manager, username, password);
        if (user == null) {
            throw new UnauthorizedException();
        }
        const jwtPayload = { username: user.username, sub: user.id };
        return {
            access_token: await this.jwtService.signAsync(jwtPayload),
            user: {
                ...user,
                profile: await user.profile,
            },
        }
    }


    async fromToken(token: string): Promise<User> {
        const payload: Record<string, string> = await this.jwtService.verifyAsync(token);
        return this.source.manager.findOneByOrFail(User, {
            username: payload.username,
        });
    }
}