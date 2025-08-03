import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {LoginService} from "./login.service";
import {Request} from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private loginService: LoginService) {}

    async canActivate(context: ExecutionContext):  Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            request['user'] = await this.loginService.fromToken(token);
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

}