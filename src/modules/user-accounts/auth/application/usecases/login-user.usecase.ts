import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import type { LoginResult } from '../types/login-result.type';

export class LoginUserCommand extends Command<LoginResult> {
  constructor(public readonly userId: string) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly jwtAdapter: JwtAdapter) {}

  async execute({ userId }: LoginUserCommand): Promise<LoginResult> {
    const accessToken = await this.jwtAdapter.createAccessToken(userId);
    const refreshToken = await this.jwtAdapter.createRefreshToken(
      userId,
      'deviceId',
    );
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
