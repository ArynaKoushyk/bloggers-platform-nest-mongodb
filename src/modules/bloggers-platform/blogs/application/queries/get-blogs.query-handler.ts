import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { Page } from '../../../../../core/types/page.type';
import type { BlogReadModel } from '../read-models/blog.read-model';
import type { BlogsQueryOptions } from '../types/blogs-query-options.type';
import type { IBlogsQueryRepository } from '../interfaces/blogs.query-repository.interface';
import { BLOGS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetBlogsQuery extends Query<Page<BlogReadModel>> {
  constructor(public readonly options: BlogsQueryOptions) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<GetBlogsQuery> {
  constructor(
    @Inject(BLOGS_QUERY_REPOSITORY)
    private readonly blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  execute({ options }: GetBlogsQuery): Promise<Page<BlogReadModel>> {
    return this.blogsQueryRepository.findAll(options);
  }
}
