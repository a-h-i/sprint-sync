import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginRequest } from './loginRequest.dto';
import { LoginResponseDto } from './loginResponse.dto';
import { plainToInstance } from 'class-transformer';

@Controller('auth')
export class AuthController {
  constructor(private loginService: LoginService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginRequest): Promise<LoginResponseDto> {
    const data = this.loginService.signIn(body.username, body.password);
    return plainToInstance(LoginResponseDto, data, {
      excludeExtraneousValues: true,
    });
  }
}
