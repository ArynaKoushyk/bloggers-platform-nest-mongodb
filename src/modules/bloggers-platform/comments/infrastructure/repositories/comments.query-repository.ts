import { Injectable } from '@nestjs/common';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import {
  CommentReadModel,
  CommentsPageReadModel,
} from '../../application/read-models/comment.read-model';
import type { ICommentsQueryRepository } from '../../application/interfaces/comments.query-repository.interface';

@Injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}

  async findAllByPostId(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<CommentsPageReadModel> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = query.calculateSkip();
    const limit = pageSize;
    const filter: FilterQuery<Comment> = { postId, deletedAt: null };

    const comments = await this.commentModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await this.commentModel.countDocuments(filter).exec();

    const commentReadModels: CommentReadModel[] = comments.map((comment) => ({
      id: comment._id.toString(),
      postId: comment.postId,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
    }));
    return {
      items: commentReadModels,
      page: pageNumber,
      pageSize,
      totalCount,
    };
  }
  async findByIdOrFail(id: string): Promise<CommentReadModel> {
    const comment = await this.commentModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .lean()
      .exec();

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found ',
      });
    }
    return {
      id: comment._id.toString(),
      postId: comment.postId,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
    };
  }
}
