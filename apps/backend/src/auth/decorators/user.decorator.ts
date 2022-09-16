import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'user/user.model';

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  }
);
