import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@sprint-sync/storage';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
