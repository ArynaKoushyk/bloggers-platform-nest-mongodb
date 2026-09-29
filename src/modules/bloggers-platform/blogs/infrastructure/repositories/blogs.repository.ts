import { Injectable } from '@nestjs/common';
import { Blog } from '../../domain/blog.entity';
import type { BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import type { IBlogsRepository } from '../../application/interfaces/blogs.repository.interface';

@Injectable()
export class BlogsRepository implements IBlogsRepository {
  constructor(@InjectModel(Blog.name) private blogModel: BlogModelType) {}

  findById(id: string): Promise<BlogDocument | null> {
    return this.blogModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .exec();
  }

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findByIdOrFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog is not found',
      });
    }

    return blog;
  }
}
