import type { LikeTargetType } from '../../domain/enums/like-target-type.enum';
import type { LikeStatus } from '../../domain/enums/like-status.enum';

export type NewestLikeReadModel = {
  addedAt: Date;
  userId: string;
  login: string;
};

export interface ILikesQueryRepository {
  findStatusByAuthorAndTarget(
    targetId: string,
    targetType: LikeTargetType,
    authorId: string,
  ): Promise<LikeStatus>;
  findStatusesByAuthorAndTargets(
    targetIds: string[],
    targetType: LikeTargetType,
    authorId: string,
  ): Promise<Map<string, LikeStatus>>;
  findNewestLikesForSingleTarget(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<NewestLikeReadModel[]>;
  findNewestLikesForMultipleTargets(
    targetIds: string[],
    targetType: LikeTargetType,
  ): Promise<Map<string, NewestLikeReadModel[]>>;
}
