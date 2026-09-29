import type { Comment } from '../../domain/comment.entity';

export interface ICommentsRepository {
  findById(id: string): Promise<Comment | null>;
  findByIdOrFail(id: string): Promise<Comment>;
  save(comment: Comment): Promise<void>;
}
