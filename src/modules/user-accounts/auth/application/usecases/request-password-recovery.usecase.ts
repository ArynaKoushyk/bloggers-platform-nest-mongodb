import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { StartPasswordRecoveryDto } from '../dto/start-password-recovery.dto';
import { randomUUID } from 'crypto';
import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { RecoveryCodeCreatedEvent } from '../events/recovery-code-created.event';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

export class RequestPasswordRecoveryCommand extends Command<void> {
  constructor(public readonly dto: StartPasswordRecoveryDto) {
    super();
  }
}

@CommandHandler(RequestPasswordRecoveryCommand)
export class RequestPasswordRecoveryUseCase implements ICommandHandler<RequestPasswordRecoveryCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ dto }: RequestPasswordRecoveryCommand): Promise<void> {
    const { email } = dto;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return;
    }

    const recoveryCode = randomUUID();

    const ttlSeconds = Number(
      this.configService.getOrThrow<string>('RECOVERY_CODE_TTL_SECONDS'),
    );

    const recoveryCodeExpirationDate = new Date(Date.now() + ttlSeconds * 1000);

    user.setRecoveryCode(recoveryCode, recoveryCodeExpirationDate);

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new RecoveryCodeCreatedEvent(dto.email, recoveryCode),
    );
  }
}
