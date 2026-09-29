import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import type { PostDocument, PostModelType } from '../../domain/post.entity';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import type { IPostsRepository } from '../../application/interfaces/posts.repository.interface';

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

  findById(id: string): Promise<PostDocument | null> {
    return this.postModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .exec();
  }

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findByIdOrFail(id: string): Promise<PostDocument> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post is not found',
      });
    }
    return post;
  }
}
