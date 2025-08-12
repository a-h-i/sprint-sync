import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@sprint-sync/storage';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request['user'] as User;
  },
);
