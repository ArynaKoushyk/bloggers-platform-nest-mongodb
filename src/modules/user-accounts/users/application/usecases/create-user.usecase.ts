import { CreateUserDto } from '../dto/create-user.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UsersFactory } from '../factories/users.factory';
import type { IUsersRepository } from '../interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

export class CreateUserCommand extends Command<string> {
  constructor(public readonly dto: CreateUserDto) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersFactory: UsersFactory,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<string> {
    const user = await this.usersFactory.createConfirmed(dto);

    await this.usersRepository.save(user);

    return user._id.toString();
  }
}
