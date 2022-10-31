import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'models';

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  }
);
