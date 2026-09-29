import type {
  CommentReadModel,
  CommentsPageReadModel,
} from '../read-models/comment.read-model';

export interface CommentsQueryParams {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  calculateSkip(): number;
}

export interface ICommentsQueryRepository {
  findAllByPostId(
    postId: string,
    query: CommentsQueryParams,
  ): Promise<CommentsPageReadModel>;
  findByIdOrFail(id: string): Promise<CommentReadModel>;
}
