import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../../application/types/authenticated-user.type';

export const OptionalCurrentUser = createParamDecorator<
  keyof AuthenticatedUser
>((prop, context: ExecutionContext): any => {
  const request = context
    .switchToHttp()
    .getRequest<{ user?: AuthenticatedUser }>();
  const user = request.user;

  if (!user) {
    return null;
  }
  if (prop) {
    return user[prop];
  } else {
    return user;
  }
});
