import type { Post } from '../../domain/post.entity';

export interface IPostsRepository {
  findById(id: string): Promise<Post | null>;
  findByIdOrFail(id: string): Promise<Post>;
  save(post: Post): Promise<void>;
}
