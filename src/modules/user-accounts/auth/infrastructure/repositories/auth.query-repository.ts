import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../../../users/domain/user.entity';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { CurrentUserReadModel } from '../../application/read-models/current-user.read-model';
import type { IAuthQueryRepository } from '../../application/interfaces/auth.query-repository.interface';

@Injectable()
export class AuthQueryRepository implements IAuthQueryRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModelType,
  ) {}

  async findCurrentUserByIdOrFail(
    userId: string,
  ): Promise<CurrentUserReadModel> {
    const user = await this.userModel
      .findOne({
        _id: userId,
        deletedAt: null,
      })
      .lean()
      .exec();

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return {
      userId: user._id.toString(),
      login: user.login,
      email: user.email,
    };
  }
}
