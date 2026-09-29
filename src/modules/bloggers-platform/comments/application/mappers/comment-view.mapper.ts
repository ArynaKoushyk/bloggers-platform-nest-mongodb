import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { LikeStatus } from '../../../likes/domain/enums/like-status.enum';
import { CommentReadModel } from '../read-models/comment.read-model';

export class CommentViewMapper {
  static toView(
    comment: CommentReadModel,
    myStatus: LikeStatus = LikeStatus.None,
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      myStatus,
    };

    return dto;
  }
}
