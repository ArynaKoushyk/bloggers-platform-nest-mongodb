import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { BlogReadModel } from '../read-models/blog.read-model';
import type { IBlogsQueryRepository } from '../interfaces/blogs.query-repository.interface';
import { BLOGS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetBlogByIdQuery extends Query<BlogReadModel> {
  constructor(public readonly blogId: string) {
    super();
  }
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(
    @Inject(BLOGS_QUERY_REPOSITORY)
    private readonly blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  execute({ blogId }: GetBlogByIdQuery): Promise<BlogReadModel> {
    return this.blogsQueryRepository.findByIdOrFail(blogId);
  }
}
