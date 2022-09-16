import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GuestToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token: string | undefined = request.cookies['tokenzy'];
    return token;
  }
);
