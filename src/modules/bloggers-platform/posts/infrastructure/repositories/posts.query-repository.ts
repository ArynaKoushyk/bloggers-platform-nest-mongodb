import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import {
  PostReadModel,
  PostsPageReadModel,
} from '../../application/read-models/post.read-model';
import type { IPostsQueryRepository } from '../../application/interfaces/posts.query-repository.interface';
@Injectable()
export class PostsQueryRepository implements IPostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModelType) {}

  async findAll(query: GetPostsQueryParams): Promise<PostsPageReadModel> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = query.calculateSkip();
    const limit = pageSize;
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    const posts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await this.postModel.countDocuments(filter);

    const postReadModels: PostReadModel[] = posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      createdAt: post.createdAt,
      blogId: post.blogId,
      blogName: post.blogName,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
    }));

    return {
      items: postReadModels,
      page: pageNumber,
      pageSize,
      totalCount,
    };
  }

  async findByIdOrFail(id: string): Promise<PostReadModel> {
    const post = await this.postModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .lean()
      .exec();
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found ',
      });
    }
    const postReadModel: PostReadModel = {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      createdAt: post.createdAt,
      blogId: post.blogId,
      blogName: post.blogName,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
    };

    return postReadModel;
  }

  async findAllByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
  ): Promise<PostsPageReadModel> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = query.calculateSkip();
    const limit = pageSize;
    const filter: FilterQuery<Post> = { blogId, deletedAt: null };

    const posts = await this.postModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const postReadModels: PostReadModel[] = posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      createdAt: post.createdAt,
      blogId: post.blogId,
      blogName: post.blogName,
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
    }));

    const totalCount = await this.postModel.countDocuments(filter);
    return {
      items: postReadModels,
      page: pageNumber,
      pageSize,
      totalCount,
    };
  }
}
