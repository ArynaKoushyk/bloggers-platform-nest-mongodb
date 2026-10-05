import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { UserContextDto } from '../../../../user-accounts/auth/application/dto/user-context.dto';
import type { ICommentsRepository } from '../../../comments/application/interfaces/comments.repository.interface';
import type { IPostsRepository } from '../../../posts/application/interfaces/posts.repository.interface';
import {
  COMMENTS_REPOSITORY,
  LIKES_REPOSITORY,
  POSTS_REPOSITORY,
} from '../../../tokens/repository.tokens';
import { LikeTargetType } from '../../domain/enums/like-target-type.enum';
import { LikeStatus } from '../../domain/enums/like-status.enum';
import { Like, type LikeModelType } from '../../domain/like.entity';
import type { ILikesRepository } from '../interfaces/likes.repository.interface';

type LikeableTarget = {
  likesCount: number;
  dislikesCount: number;
};

type LikeableTargetContext = {
  target: LikeableTarget;
  save: () => Promise<void>;
};

export class UpdateLikeStatusCommand extends Command<void> {
  constructor(
    public readonly targetId: string,
    public readonly targetType: LikeTargetType,
    public readonly likeStatus: LikeStatus,
    public readonly user: UserContextDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<UpdateLikeStatusCommand> {
  constructor(
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
    @Inject(LIKES_REPOSITORY)
    private readonly likesRepository: ILikesRepository,
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: ICommentsRepository,
  ) {}

  async execute({
    targetId,
    targetType,
    likeStatus,
    user,
  }: UpdateLikeStatusCommand): Promise<void> {
    const targetContext = await this.getTargetContext(targetId, targetType);
    const currentLike = await this.likesRepository.findByAuthorAndTarget(
      user.id,
      targetId,
      targetType,
    );
    const currentStatus = currentLike?.status ?? LikeStatus.None;

    if (currentStatus === likeStatus) {
      return;
    }

    this.updateCounters(targetContext.target, currentStatus, likeStatus);

    if (likeStatus === LikeStatus.None) {
      if (currentLike) {
        await this.likesRepository.delete(currentLike);
      }
    } else if (currentLike) {
      currentLike.updateStatus(likeStatus);
      await this.likesRepository.save(currentLike);
    } else {
      const like = this.likeModel.createInstance({
        targetId,
        targetType,
        authorId: user.id,
        authorLogin: user.login,
        status: likeStatus,
      });

      await this.likesRepository.save(like);
    }

    await targetContext.save();
  }

  private async getTargetContext(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<LikeableTargetContext> {
    if (targetType === LikeTargetType.Post) {
      const post = await this.postsRepository.findByIdOrFail(targetId);
      return {
        target: post,
        save: () => this.postsRepository.save(post),
      };
    }

    const comment = await this.commentsRepository.findByIdOrFail(targetId);

    return {
      target: comment,
      save: () => this.commentsRepository.save(comment),
    };
  }

  private updateCounters(
    target: LikeableTarget,
    currentStatus: LikeStatus,
    nextStatus: LikeStatus,
  ): void {
    if (currentStatus === LikeStatus.Like) {
      target.likesCount -= 1;
    }

    if (currentStatus === LikeStatus.Dislike) {
      target.dislikesCount -= 1;
    }

    if (nextStatus === LikeStatus.Like) {
      target.likesCount += 1;
    }

    if (nextStatus === LikeStatus.Dislike) {
      target.dislikesCount += 1;
    }
  }
}
