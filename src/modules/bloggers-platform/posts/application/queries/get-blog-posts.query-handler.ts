import { PaginatedViewDto } from '../../../../../core/dto/base-paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostViewMapper } from '../mappers/post-view.mapper';
import { LikeTargetType } from '../../../likes/domain/enums/like-target-type.enum';
import type { IPostsQueryRepository } from '../interfaces/posts.query-repository.interface';
import type { IBlogsQueryRepository } from '../../../blogs/application/interfaces/blogs.query-repository.interface';
import type { ILikesQueryRepository } from '../../../likes/application/interfaces/likes.query-repository.interface';
import {
  BLOGS_QUERY_REPOSITORY,
  LIKES_QUERY_REPOSITORY,
  POSTS_QUERY_REPOSITORY,
} from '../../../tokens/repository.tokens';
import { LikeStatus } from '../../../likes/domain/enums/like-status.enum';

export class GetBlogPostsQuery extends Query<PaginatedViewDto<PostViewDto[]>> {
  constructor(
    public readonly blogId: string,
    public readonly queryParams: GetPostsQueryParams,
    public readonly userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetBlogPostsQuery)
export class GetBlogPostsQueryHandler implements IQueryHandler<GetBlogPostsQuery> {
  constructor(
    @Inject(BLOGS_QUERY_REPOSITORY)
    private readonly blogsQueryRepository: IBlogsQueryRepository,
    @Inject(POSTS_QUERY_REPOSITORY)
    private readonly postsQueryRepository: IPostsQueryRepository,
    @Inject(LIKES_QUERY_REPOSITORY)
    private readonly likesQueryRepository: ILikesQueryRepository,
  ) {}

  async execute({
    queryParams,
    blogId,
    userId,
  }: GetBlogPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    await this.blogsQueryRepository.findByIdOrFail(blogId);

    const postsPage = await this.postsQueryRepository.findAllByBlogId(
      blogId,
      queryParams,
    );
    const postIds = postsPage.items.map((post) => post.id);

    const newestLikesByPost =
      await this.likesQueryRepository.findNewestLikesForMultipleTargets(
        postIds,
        LikeTargetType.Post,
      );

    const statusesByPost = await this.getStatusesByPost(postIds, userId);

    const items = postsPage.items.map((post) => {
      const status = statusesByPost.get(post.id);
      const newestLikes = newestLikesByPost.get(post.id);

      return PostViewMapper.toView(
        post,
        status ?? LikeStatus.None,
        newestLikes ?? [],
      );
    });

    return PaginatedViewDto.mapToView({
      items,
      page: postsPage.page,
      size: postsPage.pageSize,
      totalCount: postsPage.totalCount,
    });
  }

  private async getStatusesByPost(
    postIds: string[],
    userId: string | null,
  ): Promise<Map<string, LikeStatus>> {
    if (userId === null) {
      return new Map<string, LikeStatus>();
    } else {
      return await this.likesQueryRepository.findStatusesByAuthorAndTargets(
        postIds,
        LikeTargetType.Post,
        userId,
      );
    }
  }
}
