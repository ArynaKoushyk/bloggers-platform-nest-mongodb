import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AUTH_SESSIONS_REPOSITORY } from '../../../tokens/repository.tokens';
import { type IAuthSessionsRepository } from '../interfaces/auth-sessions.repository.interface';
import { Inject } from '@nestjs/common';
import { AuthSessionAccessPolicy } from '../policies/auth-session-access.policy';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../../../../core/exceptions/domain.exception';

export class TerminateDeviceSessionCommand extends Command<void> {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {
    super();
  }
}

@CommandHandler(TerminateDeviceSessionCommand)
export class TerminateDeviceSessionUseCase implements ICommandHandler<TerminateDeviceSessionCommand> {
  constructor(
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: IAuthSessionsRepository,
    private readonly authSessionAccessPolicy: AuthSessionAccessPolicy,
  ) {}
  async execute({
    userId,
    deviceId,
  }: TerminateDeviceSessionCommand): Promise<void> {
    const session = await this.authSessionsRepository.findByDeviceId(deviceId);

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device session not found',
      });
    }

    this.authSessionAccessPolicy.assertCanModify(session, userId);

    await this.authSessionsRepository.deleteByDeviceId(deviceId);
  }
}
