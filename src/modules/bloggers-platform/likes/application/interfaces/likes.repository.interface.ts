import type { Like } from '../../domain/like.entity';
import type { LikeTargetType } from '../../domain/enums/like-target-type.enum';

export interface ILikesRepository {
  findByAuthorAndTarget(
    authorId: string,
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<Like | null>;
  save(like: Like): Promise<void>;
  delete(like: Like): Promise<void>;
  deleteAllByTarget(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<void>;
}
