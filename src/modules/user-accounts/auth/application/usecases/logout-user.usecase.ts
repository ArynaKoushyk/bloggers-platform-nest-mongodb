import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { IAuthSessionsRepository } from '../../../security-devices/application/interfaces/auth-sessions.repository.interface';
import { AUTH_SESSIONS_REPOSITORY } from '../../../tokens/repository.tokens';

export class LogoutUserCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
    public readonly refreshTokenId: string,
  ) {
    super();
  }
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: IAuthSessionsRepository,
  ) {}
  async execute({
    userId,
    deviceId,
    refreshTokenId,
  }: LogoutUserCommand): Promise<void> {
    await this.authSessionsRepository.deleteCurrentSession(
      userId,
      deviceId,
      refreshTokenId,
    );
  }
}
