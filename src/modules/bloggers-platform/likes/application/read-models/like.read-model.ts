import type { StoredLikeStatus } from '../../domain/enums/like-status.enum';

export type LikeDetailsReadModel = {
  targetId: string;
  authorId: string;
  authorLogin: string;
  createdAt: Date;
};

export type LikeStatusReadModel = {
  targetId: string;
  status: StoredLikeStatus;
};
