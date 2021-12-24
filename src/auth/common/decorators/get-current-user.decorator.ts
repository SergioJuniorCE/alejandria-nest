import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    console.log(request);
    if (!data) return request.user;
    return request.user[data];
  },
);
