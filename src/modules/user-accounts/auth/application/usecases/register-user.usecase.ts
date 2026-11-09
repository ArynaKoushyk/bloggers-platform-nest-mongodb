import { RegisterUserDto } from '../dto/register-user.dto';
import { UsersFactory } from '../../../users/application/factories/users.factory';
import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { Inject } from '@nestjs/common';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';
import { UserAccountsConfig } from '../../../config/user-accounts.config';

export class RegisterUserCommand extends Command<void> {
  constructor(public readonly dto: RegisterUserDto) {
    super();
  }
}
@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly usersFactory: UsersFactory,
    private readonly config: UserAccountsConfig,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const confirmationCode = randomUUID();

    const ttlSeconds = this.config.confirmationCodeTtlSeconds;
    const confirmationCodeExpirationDate = new Date(
      Date.now() + ttlSeconds * 1000,
    );

    const user = await this.usersFactory.createUnconfirmed(
      dto,
      confirmationCode,
      confirmationCodeExpirationDate,
    );

    await this.usersRepository.save(user);

    this.eventBus.publish(new UserRegisteredEvent(dto.email, confirmationCode));
  }
}
