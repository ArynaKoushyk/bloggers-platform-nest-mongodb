import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base-paginated.view-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { CommentViewMapper } from '../mappers/comment-view.mapper';
import { LikeStatus } from '../../../likes/domain/enums/like-status.enum';
import { LikeTargetType } from '../../../likes/domain/enums/like-target-type.enum';
import type { ICommentsQueryRepository } from '../interfaces/comments.query-repository.interface';
import type { IPostsQueryRepository } from '../../../posts/application/interfaces/posts.query-repository.interface';
import type { ILikesQueryRepository } from '../../../likes/application/interfaces/likes.query-repository.interface';
import {
  COMMENTS_QUERY_REPOSITORY,
  LIKES_QUERY_REPOSITORY,
  POSTS_QUERY_REPOSITORY,
} from '../../../tokens/repository.tokens';

export class GetPostCommentsQuery extends Query<
  PaginatedViewDto<CommentViewDto[]>
> {
  constructor(
    public readonly postId: string,
    public readonly queryParams: GetCommentsQueryParams,
    public readonly userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsQueryHandler implements IQueryHandler<GetPostCommentsQuery> {
  constructor(
    @Inject(COMMENTS_QUERY_REPOSITORY)
    private readonly commentsQueryRepository: ICommentsQueryRepository,
    @Inject(POSTS_QUERY_REPOSITORY)
    private readonly postsQueryRepository: IPostsQueryRepository,
    @Inject(LIKES_QUERY_REPOSITORY)
    private readonly likesQueryRepository: ILikesQueryRepository,
  ) {}

  async execute({
    postId,
    userId,
    queryParams,
  }: GetPostCommentsQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.findByIdOrFail(postId);

    const commentsPage = await this.commentsQueryRepository.findAllByPostId(
      postId,
      queryParams,
    );

    const commentIds = commentsPage.items.map((comment) => comment.id);

    const statusesByComment = await this.getStatusesByComment(
      commentIds,
      userId,
    );

    const items = commentsPage.items.map((comment) => {
      const status = statusesByComment.get(comment.id);
      return CommentViewMapper.toView(comment, status ?? LikeStatus.None);
    });

    return PaginatedViewDto.mapToView({
      items,
      page: commentsPage.page,
      size: commentsPage.pageSize,
      totalCount: commentsPage.totalCount,
    });
  }

  private async getStatusesByComment(
    commentIds: string[],
    userId: string | null,
  ): Promise<Map<string, LikeStatus>> {
    if (userId === null) {
      return new Map<string, LikeStatus>();
    } else {
      return await this.likesQueryRepository.findStatusesByAuthorAndTargets(
        commentIds,
        LikeTargetType.Comment,
        userId,
      );
    }
  }
}
