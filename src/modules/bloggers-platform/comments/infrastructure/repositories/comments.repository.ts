import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  type CommentModelType,
} from '../../domain/comment.entity';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import type { ICommentsRepository } from '../../application/interfaces/comments.repository.interface';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModelType,
  ) {}

  findById(id: string): Promise<CommentDocument | null> {
    return this.commentModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .exec();
  }

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findByIdOrFail(id: string): Promise<CommentDocument> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment is not found',
      });
    }
    return comment;
  }
}
