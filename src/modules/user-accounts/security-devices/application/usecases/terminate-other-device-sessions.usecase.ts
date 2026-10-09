import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AUTH_SESSIONS_REPOSITORY } from '../../../tokens/repository.tokens';
import type { IAuthSessionsRepository } from '../interfaces/auth-sessions.repository.interface';

export class TerminateOtherDeviceSessionsCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly currentDeviceId: string,
  ) {
    super();
  }
}

@CommandHandler(TerminateOtherDeviceSessionsCommand)
export class TerminateOtherDeviceSessionsUseCase implements ICommandHandler<TerminateOtherDeviceSessionsCommand> {
  constructor(
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: IAuthSessionsRepository,
  ) {}

  async execute({
    userId,
    currentDeviceId,
  }: TerminateOtherDeviceSessionsCommand): Promise<void> {
    await this.authSessionsRepository.deleteAllOtherSessionsForUser(
      userId,
      currentDeviceId,
    );
  }
}
