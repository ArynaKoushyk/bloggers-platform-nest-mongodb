import { RegisterUserDto } from '../dto/register-user.dto';
import { UsersFactory } from '../../../users/application/factories/users.factory';
import {
  Command,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { Inject } from '@nestjs/common';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

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
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const confirmationCode = randomUUID();

    const ttlSeconds = Number(
      this.configService.getOrThrow<string>('CONFIRMATION_CODE_TTL_SECONDS'),
    );

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
