import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../../domain/user.entity';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import {
  UserReadModel,
  UsersPageReadModel,
} from '../../application/read-models/user.read-model';
import type { IUsersQueryRepository } from '../../application/interfaces/users.query-repository.interface';

@Injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: UserModelType) {}

  async findAll(query: GetUsersQueryParams): Promise<UsersPageReadModel> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    } = query;
    const skip = query.calculateSkip();
    const limit = pageSize;
    const filter: FilterQuery<User> = { deletedAt: null };
    const searchConditions: FilterQuery<User>[] = [];

    if (searchLoginTerm) {
      searchConditions.push({
        login: {
          $regex: query.searchLoginTerm,
          $options: 'i',
        },
      });
    }

    if (searchEmailTerm) {
      searchConditions.push({
        email: {
          $regex: query.searchEmailTerm,
          $options: 'i',
        },
      });
    }

    if (searchConditions.length > 0) {
      filter.$or = searchConditions;
    }

    const users = await this.userModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await this.userModel.countDocuments(filter).exec();

    const userReadModels: UserReadModel[] = users.map((user) => ({
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    }));

    return {
      items: userReadModels,
      page: pageNumber,
      pageSize,
      totalCount,
    };
  }

  async findByIdOrFail(id: string): Promise<UserReadModel> {
    const user = await this.userModel
      .findOne({
        _id: id,
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
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
