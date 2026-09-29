import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base-paginated.view-dto';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserViewMapper } from '../mappers/user-view.mapper';
import type { IUsersQueryRepository } from '../interfaces/users.query-repository.interface';
import { USERS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetUsersQuery extends Query<PaginatedViewDto<UserViewDto[]>> {
  constructor(public readonly queryParams: GetUsersQueryParams) {
    super();
  }
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @Inject(USERS_QUERY_REPOSITORY)
    private readonly usersQueryRepository: IUsersQueryRepository,
  ) {}

  async execute({
    queryParams,
  }: GetUsersQuery): Promise<PaginatedViewDto<UserViewDto[]>> {
    const usersPage = await this.usersQueryRepository.findAll(queryParams);
    const items = usersPage.items.map((user) => UserViewMapper.toView(user));
    return PaginatedViewDto.mapToView({
      items,
      page: usersPage.page,
      size: usersPage.pageSize,
      totalCount: usersPage.totalCount,
    });
  }
}
