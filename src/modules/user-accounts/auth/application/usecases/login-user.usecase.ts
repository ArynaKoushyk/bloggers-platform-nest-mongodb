import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import { AuthTokensResult } from '../types/auth-tokens-result.type';

export class LoginUserCommand extends Command<AuthTokensResult> {
  constructor(public readonly userId: string) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly jwtAdapter: JwtAdapter) {}

  async execute({ userId }: LoginUserCommand): Promise<AuthTokensResult> {
    const accessToken = await this.jwtAdapter.createAccessToken(userId);
    const refreshToken = await this.jwtAdapter.createRefreshToken(
      userId,
      'deviceId',
      'refreshToken',
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
