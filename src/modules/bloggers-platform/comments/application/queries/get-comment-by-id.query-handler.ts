import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentViewMapper } from '../mappers/comment-view.mapper';
import type { ICommentsQueryRepository } from '../interfaces/comments.query-repository.interface';
import {
  COMMENTS_QUERY_REPOSITORY,
  LIKES_QUERY_REPOSITORY,
} from '../../../tokens/repository.tokens';
import { LikeStatus } from '../../../likes/domain/enums/like-status.enum';
import { type ILikesQueryRepository } from '../../../likes/application/interfaces/likes.query-repository.interface';
import { LikeTargetType } from '../../../likes/domain/enums/like-target-type.enum';

export class GetCommentByIdQuery extends Query<CommentViewDto> {
  constructor(
    public readonly commentId: string,
    public readonly userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    @Inject(COMMENTS_QUERY_REPOSITORY)
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    @Inject(LIKES_QUERY_REPOSITORY)
    private readonly likesQueryRepository: ILikesQueryRepository,
  ) {}

  async execute({
    commentId,
    userId,
  }: GetCommentByIdQuery): Promise<CommentViewDto> {
    const comment =
      await this.commentsQueryRepository.findByIdOrFail(commentId);

    const userStatus = await this.getCommentStatusForUser(commentId, userId);
    return CommentViewMapper.toView(comment, userStatus);
  }

  private async getCommentStatusForUser(
    commentId: string,
    userId: string | null,
  ): Promise<LikeStatus> {
    if (userId === null) {
      return LikeStatus.None;
    } else {
      return await this.likesQueryRepository.findStatusByAuthorAndTarget(
        commentId,
        LikeTargetType.Comment,
        userId,
      );
    }
  }
}
