import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { PasswordHashAdapter } from '../../../users/infrastructure/adapters/password-hash.adapter';
import { ResetPasswordError } from '../../../users/domain/enums/reset-password-error.enum';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

export class ResetPasswordCommand extends Command<void> {
  constructor(public readonly dto: ResetPasswordDto) {
    super();
  }
}

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordUseCase implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHashAdapter: PasswordHashAdapter,
  ) {}

  async execute({ dto }: ResetPasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = dto;
    const user = await this.usersRepository.findByRecoveryCode(recoveryCode);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is invalid or expired',
        extensions: [
          {
            message: 'Recovery code is invalid or expired',
            key: 'recoveryCode',
          },
        ],
      });
    }

    const currentDate = new Date();

    const newPasswordHash =
      await this.passwordHashAdapter.hashPassword(newPassword);
    const result = user.resetPassword(
      recoveryCode,
      newPasswordHash,
      currentDate,
    );

    if (result === ResetPasswordError.ExpiredRecoveryCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is expired',
        extensions: [
          {
            message: 'Recovery code is expired',
            key: 'recoveryCode',
          },
        ],
      });
    }

    if (result === ResetPasswordError.InvalidRecoveryCode) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Recovery code is invalid',
        extensions: [
          {
            message: 'Recovery code is invalid',
            key: 'recoveryCode',
          },
        ],
      });
    }

    await this.usersRepository.save(user);
  }
}
