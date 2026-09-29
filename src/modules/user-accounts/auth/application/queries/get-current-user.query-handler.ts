import { Query } from '@nestjs/cqrs';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CurrentUserViewDto } from '../../api/view-dto/current-user.view-dto';
import type { IAuthQueryRepository } from '../interfaces/auth.query-repository.interface';
import { AUTH_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetCurrentUserQuery extends Query<CurrentUserViewDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserQueryHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(
    @Inject(AUTH_QUERY_REPOSITORY)
    private readonly authQueryRepository: IAuthQueryRepository,
  ) {}

  execute({ userId }: GetCurrentUserQuery): Promise<CurrentUserViewDto> {
    return this.authQueryRepository.findCurrentUserByIdOrFail(userId);
  }
}
