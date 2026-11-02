import type { Page } from '../../../../../core/types/page.type';
import type { BlogReadModel } from '../read-models/blog.read-model';
import type { BlogsQueryOptions } from '../types/blogs-query-options.type';

export interface IBlogsQueryRepository {
  findAll(options: BlogsQueryOptions): Promise<Page<BlogReadModel>>;
  findByIdOrFail(id: string): Promise<BlogReadModel>;
}
