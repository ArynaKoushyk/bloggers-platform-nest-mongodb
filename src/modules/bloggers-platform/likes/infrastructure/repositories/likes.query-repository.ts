import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, type LikeModelType } from '../../domain/like.entity';
import { LikeTargetType } from '../../domain/enums/like-target-type.enum';
import { LikeStatus } from '../../domain/enums/like-status.enum';
import type { ILikesQueryRepository } from '../../application/interfaces/likes.query-repository.interface';
import { LikeDetailsReadModel } from '../../application/read-models/like.read-model';

@Injectable()
export class LikesQueryRepository implements ILikesQueryRepository {
  constructor(
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
  ) {}

  async findStatusByAuthorAndTarget(
    targetId: string,
    targetType: LikeTargetType,
    authorId: string,
  ): Promise<LikeStatus> {
    const like = await this.likeModel
      .findOne({
        targetId,
        targetType,
        authorId,
      })
      .lean()
      .exec();

    if (!like) {
      return LikeStatus.None;
    }
    return like.status;
  }

  async findStatusesByAuthorAndTargets(
    targetIds: string[],
    targetType: LikeTargetType,
    authorId: string,
  ): Promise<Map<string, LikeStatus>> {
    const statuses = new Map<string, LikeStatus>();

    for (const targetId of targetIds) {
      statuses.set(targetId, LikeStatus.None);
    }

    if (targetIds.length === 0) {
      return statuses;
    }

    const likes = await this.likeModel
      .find({
        targetId: { $in: targetIds },
        targetType,
        authorId,
      })
      .lean()
      .exec();

    for (const like of likes) {
      statuses.set(like.targetId, like.status);
    }

    return statuses;
  }

  async findNewestLikesForSingleTarget(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<LikeDetailsReadModel[]> {
    const likes = await this.likeModel
      .find({
        targetId,
        targetType,
        status: LikeStatus.Like,
      })
      .sort({
        createdAt: -1,
        _id: -1,
      })
      .limit(3)
      .lean()
      .exec();

    return likes.map((like): LikeDetailsReadModel => ({
      targetId: like.targetId,
      authorId: like.authorId,
      authorLogin: like.authorLogin,
      createdAt: like.createdAt,
    }));
  }

  async findNewestLikesForMultipleTargets(
    targetIds: string[],
    targetType: LikeTargetType,
  ): Promise<Map<string, LikeDetailsReadModel[]>> {
    const newestLikesByTarget = new Map<string, LikeDetailsReadModel[]>(
      targetIds.map((targetId) => [targetId, []]),
    );

    if (targetIds.length === 0) {
      return newestLikesByTarget;
    }

    const likes = await this.likeModel
      .find({
        targetId: { $in: targetIds },
        targetType,
        status: LikeStatus.Like,
      })
      .sort({
        targetId: 1,
        createdAt: -1,
        _id: -1,
      })
      .lean()
      .exec();

    for (const like of likes) {
      const newestLikes = newestLikesByTarget.get(like.targetId);

      if (newestLikes && newestLikes.length < 3) {
        newestLikes.push({
          targetId: like.targetId,
          authorId: like.authorId,
          authorLogin: like.authorLogin,
          createdAt: like.createdAt,
        });
      }
    }

    return newestLikesByTarget;
  }
}
