import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { ResendConfirmationEmailDto } from '../dto/resend-confirmation-email.dto';
import { randomUUID } from 'crypto';
import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { ConfirmationCodeRenewedEvent } from '../events/confirmation-code-renewed.event';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

export class ResendConfirmationEmailCommand extends Command<void> {
  constructor(public readonly dto: ResendConfirmationEmailDto) {
    super();
  }
}
@CommandHandler(ResendConfirmationEmailCommand)
export class ResendConfirmationEmailUseCase implements ICommandHandler<ResendConfirmationEmailCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ dto }: ResendConfirmationEmailCommand): Promise<void> {
    const { email } = dto;
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        errorsMessages: [
          { field: 'email', message: 'Email is not registered' },
        ],
      });
    }

    const newConfirmationCode = randomUUID();

    const ttlSeconds = Number(
      this.configService.getOrThrow<string>('CONFIRMATION_CODE_TTL_SECONDS'),
    );

    const newConfirmationCodeExpirationDate = new Date(
      Date.now() + ttlSeconds * 1000,
    );

    const isUpdated = user.setConfirmationCode(
      newConfirmationCode,
      newConfirmationCodeExpirationDate,
    );

    if (!isUpdated) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        errorsMessages: [
          { field: 'email', message: 'Email is already confirmed' },
        ],
      });
    }

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new ConfirmationCodeRenewedEvent(dto.email, newConfirmationCode),
    );
  }
}
