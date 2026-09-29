import { Inject, Injectable } from '@nestjs/common';
import { PasswordHashAdapter } from '../../users/infrastructure/adapters/password-hash.adapter';
import { UserContextDto } from './dto/user-context.dto';
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
  ): Promise<UserContextDto> {
    const user = await this.usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
      });
    }
    const isPasswordValid = await this.passwordHashAdapter.verifyPassword({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
      });
    }

    return {
      id: user.id,
      login: user.login,
    };
  }
}
