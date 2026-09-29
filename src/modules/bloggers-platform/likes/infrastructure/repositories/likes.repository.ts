import { Injectable } from '@nestjs/common';
import { LikeTargetType } from '../../domain/enums/like-target-type.enum';
import {
  Like,
  LikeDocument,
  type LikeModelType,
} from '../../domain/like.entity';
import { InjectModel } from '@nestjs/mongoose';
import type { ILikesRepository } from '../../application/interfaces/likes.repository.interface';

@Injectable()
export class LikesRepository implements ILikesRepository {
  constructor(
    @InjectModel(Like.name)
    private readonly likeModel: LikeModelType,
  ) {}
  async findByAuthorAndTarget(
    authorId: string,
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<LikeDocument | null> {
    return await this.likeModel
      .findOne({
        targetId,
        targetType,
        authorId,
      })
      .exec();
  }

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async delete(like: LikeDocument): Promise<void> {
    await like.deleteOne();
  }

  async deleteAllByTarget(
    targetId: string,
    targetType: LikeTargetType,
  ): Promise<void> {
    await this.likeModel.deleteMany({ targetId, targetType }).exec();
  }
}
