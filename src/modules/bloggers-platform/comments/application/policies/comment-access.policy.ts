import { Injectable } from '@nestjs/common';
import type { Comment } from '../../domain/comment.entity';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';

@Injectable()
export class CommentAccessPolicy {
  assertCanModify(comment: Comment, userId: string): void {
    if (comment.commentatorInfo.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not the owner of this comment',
      });
    }
  }
}
