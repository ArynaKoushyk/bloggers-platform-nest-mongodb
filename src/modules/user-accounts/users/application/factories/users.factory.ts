import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  type UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { PasswordHashAdapter } from '../../infrastructure/adapters/password-hash.adapter';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserDomainDto } from '../../domain/dto/create-user.domain.dto';
import { CreateUnconfirmedUserDomainDto } from '../../domain/dto/create-unconfirmed-user.domain.dto';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import type { IUsersRepository } from '../interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

@Injectable()
export class UsersFactory {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    private readonly passwordHashAdapter: PasswordHashAdapter,
  ) {}

  async createConfirmed(dto: CreateUserDto): Promise<UserDocument> {
    await this.ensureUserDoesNotExist(dto.login, dto.email);

    const passwordHash = await this.passwordHashAdapter.hashPassword(
      dto.password,
    );

    const domainDto: CreateUserDomainDto = {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };

    return this.userModel.createConfirmed(domainDto);
  }

  async createUnconfirmed(
    dto: CreateUserDto,
    confirmationCode: string,
    confirmationCodeExpirationDate: Date,
  ): Promise<UserDocument> {
    await this.ensureUserDoesNotExist(dto.login, dto.email);

    const passwordHash = await this.passwordHashAdapter.hashPassword(
      dto.password,
    );

    const domainDto: CreateUnconfirmedUserDomainDto = {
      login: dto.login,
      email: dto.email,
      passwordHash,
      confirmationCode,
      confirmationCodeExpirationDate,
    };

    return this.userModel.createUnconfirmed(domainDto);
  }

  private async ensureUserDoesNotExist(
    login: string,
    email: string,
  ): Promise<void> {
    const existingLogin = await this.usersRepository.findByLogin(login);

    if (existingLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same login already exists',
        extensions: [
          {
            message: 'User with the same login already exists',
            key: 'login',
          },
        ],
      });
    }

    const existingEmail = await this.usersRepository.findByEmail(email);

    if (existingEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User with the same email already exists',
        extensions: [
          {
            message: 'User with the same email already exists',
            key: 'email',
          },
        ],
      });
    }
  }
}
