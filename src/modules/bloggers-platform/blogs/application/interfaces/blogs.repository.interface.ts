import type { Blog } from '../../domain/blog.entity';

export interface IBlogsRepository {
  findById(id: string): Promise<Blog | null>;
  findByIdOrFail(id: string): Promise<Blog>;
  save(blog: Blog): Promise<void>;
}
