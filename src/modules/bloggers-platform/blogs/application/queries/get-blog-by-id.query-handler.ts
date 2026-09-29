import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogViewMapper } from '../mappers/blog-view.mapper';
import type { IBlogsQueryRepository } from '../interfaces/blogs.query-repository.interface';
import { BLOGS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetBlogByIdQuery extends Query<BlogViewDto> {
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

  async execute({ blogId }: GetBlogByIdQuery): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.findByIdOrFail(blogId);
    return BlogViewMapper.toView(blog);
  }
}
