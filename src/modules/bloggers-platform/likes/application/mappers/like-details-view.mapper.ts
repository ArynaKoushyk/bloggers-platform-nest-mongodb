import { LikeDetailsViewDto } from '../../api/view-dto/like-details.view-dto';
import { LikeDetailsReadModel } from '../read-models/like.read-model';

export class LikeDetailsViewMapper {
  static toView(like: LikeDetailsReadModel): LikeDetailsViewDto {
    const dto = new LikeDetailsViewDto();

    dto.addedAt = like.createdAt;
    dto.userId = like.authorId;
    dto.login = like.authorLogin;

    return dto;
  }
}
