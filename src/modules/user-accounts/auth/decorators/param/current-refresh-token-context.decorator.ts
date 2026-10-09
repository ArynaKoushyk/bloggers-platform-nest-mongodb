import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RefreshTokenContext } from '../../application/types/refresh-token-context.type';

export const CurrentRefreshTokenContext = createParamDecorator(
  (_data: unknown, context: ExecutionContext): RefreshTokenContext => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: RefreshTokenContext }>();

    const user = request.user;

    if (!user) {
      throw new Error('there is no user in the request object!');
    }

    return user;
  },
);
