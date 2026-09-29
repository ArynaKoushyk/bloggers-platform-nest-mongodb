import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UserViewMapper } from '../mappers/user-view.mapper';
import { USERS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';
import { Inject } from '@nestjs/common';
import type { IUsersQueryRepository } from '../interfaces/users.query-repository.interface';

export class GetUserByIdQuery extends Query<UserViewDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject(USERS_QUERY_REPOSITORY)
    private readonly usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute({ userId }: GetUserByIdQuery): Promise<UserViewDto> {
    const user = await this.usersQueryRepository.findByIdOrFail(userId);
    return UserViewMapper.toView(user);
  }
}
