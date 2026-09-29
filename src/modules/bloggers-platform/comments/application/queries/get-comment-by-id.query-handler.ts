import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentViewMapper } from '../mappers/comment-view.mapper';
import type { ICommentsQueryRepository } from '../interfaces/comments.query-repository.interface';
import { COMMENTS_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';

export class GetCommentByIdQuery extends Query<CommentViewDto> {
  constructor(public readonly commentId: string) {
    super();
  }
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdQueryHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(
    @Inject(COMMENTS_QUERY_REPOSITORY)
    private readonly commentsQueryRepository: ICommentsQueryRepository,
  ) {}

  async execute({ commentId }: GetCommentByIdQuery): Promise<CommentViewDto> {
    const comment =
      await this.commentsQueryRepository.findByIdOrFail(commentId);
    return CommentViewMapper.toView(comment);
  }
}
