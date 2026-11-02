import { Inject, Injectable } from '@nestjs/common';
import { PasswordHashAdapter } from '../../users/infrastructure/adapters/password-hash.adapter';
import type { AuthenticatedUser } from './types/authenticated-user.type';
import { DomainException } from '../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code.enum';
import type { IUsersRepository } from '../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../tokens/repository.tokens';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHashAdapter: PasswordHashAdapter,
  ) {}

  async validateCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        errorsMessages: [{ field: null, message: 'Invalid credentials' }],
      });
    }
    const isPasswordValid = await this.passwordHashAdapter.verifyPassword({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        errorsMessages: [{ field: null, message: 'Invalid credentials' }],
      });
    }

    return {
      userId: user.id,
      login: user.login,
    };
  }
}
