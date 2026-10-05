import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../domain/enums/like-status.enum';

export class UpdateLikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
