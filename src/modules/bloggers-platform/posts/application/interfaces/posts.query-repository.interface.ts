import type {
  PostReadModel,
  PostsPageReadModel,
} from '../read-models/post.read-model';

export interface PostsQueryParams {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchNameTerm: string | null;
  calculateSkip(): number;
}

export interface IPostsQueryRepository {
  findAll(query: PostsQueryParams): Promise<PostsPageReadModel>;
  findByIdOrFail(id: string): Promise<PostReadModel>;
  findAllByBlogId(
    blogId: string,
    query: PostsQueryParams,
  ): Promise<PostsPageReadModel>;
}
