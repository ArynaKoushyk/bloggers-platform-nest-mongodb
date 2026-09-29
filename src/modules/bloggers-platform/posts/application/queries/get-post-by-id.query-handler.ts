import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostViewMapper } from '../mappers/post-view.mapper';
import { LikeTargetType } from '../../../likes/domain/enums/like-target-type.enum';
import type { IPostsQueryRepository } from '../interfaces/posts.query-repository.interface';
import type { ILikesQueryRepository } from '../../../likes/application/interfaces/likes.query-repository.interface';
import {
  LIKES_QUERY_REPOSITORY,
  POSTS_QUERY_REPOSITORY,
} from '../../../tokens/repository.tokens';

export class GetPostByIdQuery extends Query<PostViewDto> {
  constructor(public readonly postId: string) {
    super();
  }
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(
    @Inject(POSTS_QUERY_REPOSITORY)
    private readonly postsQueryRepository: IPostsQueryRepository,
    @Inject(LIKES_QUERY_REPOSITORY)
    private readonly likesQueryRepository: ILikesQueryRepository,
  ) {}

  async execute({ postId }: GetPostByIdQuery): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findByIdOrFail(postId);
    const newestLikes =
      await this.likesQueryRepository.findNewestLikesForSingleTarget(
        postId,
        LikeTargetType.Post,
      );

    return PostViewMapper.toView(post, newestLikes);
  }
}
