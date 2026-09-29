import type {
  BlogReadModel,
  BlogsPageReadModel,
} from '../read-models/blog.read-model';

export interface BlogsQueryParams {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchNameTerm: string | null;
  calculateSkip(): number;
}

export interface IBlogsQueryRepository {
  findAll(query: BlogsQueryParams): Promise<BlogsPageReadModel>;
  findByIdOrFail(id: string): Promise<BlogReadModel>;
}
