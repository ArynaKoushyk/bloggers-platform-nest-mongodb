import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserContextDto } from '../../application/dto/user-context.dto';

export const OptionalCurrentUser = createParamDecorator<keyof UserContextDto>(
  (prop, context: ExecutionContext): any => {
    const request = context
      .switchToHttp()
      .getRequest<{ user?: UserContextDto }>();
    const user = request.user;

    if (!user) {
      return null;
    }
    if (prop) {
      return user[prop];
    } else {
      return user;
    }
  },
);
