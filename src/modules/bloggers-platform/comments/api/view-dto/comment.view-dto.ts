import { LikesInfoViewDto } from '../../../likes/api/view-dto/likes-info.view-dto';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: LikesInfoViewDto;
}
