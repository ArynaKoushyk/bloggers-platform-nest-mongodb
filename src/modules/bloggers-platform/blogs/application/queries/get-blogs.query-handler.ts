import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base-paginated.view-dto';
import { BlogViewMapper } from '../mappers/blog-view.mapper';
import type { IBlogsQueryRepository } from '../interfaces/blogs.query-repository.interface';
import { BLOGS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetBlogsQuery extends Query<PaginatedViewDto<BlogViewDto[]>> {
  constructor(public readonly queryParams: GetBlogsQueryParams) {
    super();
  }
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler implements IQueryHandler<GetBlogsQuery> {
  constructor(
    @Inject(BLOGS_QUERY_REPOSITORY)
    private readonly blogsQueryRepository: IBlogsQueryRepository,
  ) {}

  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { queryParams } = query;

    const blogsPage = await this.blogsQueryRepository.findAll(queryParams);

    const items = blogsPage.items.map((blog) => BlogViewMapper.toView(blog));

    return PaginatedViewDto.mapToView({
      items,
      page: blogsPage.page,
      size: blogsPage.pageSize,
      totalCount: blogsPage.totalCount,
    });
  }
}
