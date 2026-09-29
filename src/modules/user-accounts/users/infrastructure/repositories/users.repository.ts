import { Injectable } from '@nestjs/common';
import {
  User,
  UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import type { IUsersRepository } from '../../application/interfaces/users.repository.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async save(user: UserDocument): Promise<void> {
    await user.save();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .exec();
  }

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByLogin(login: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ login, deletedAt: null }).exec();
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email, deletedAt: null }).exec();
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
        deletedAt: null,
      })
      .exec();
  }

  async findByConfirmationCode(code: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({
        'emailConfirmation.confirmationCode': code,
        deletedAt: null,
      })
      .exec();
  }

  async findByRecoveryCode(recoveryCode: string): Promise<UserDocument | null> {
    return await this.userModel
      .findOne({
        'passwordRecovery.recoveryCode': recoveryCode,
        deletedAt: null,
      })
      .exec();
  }
}
