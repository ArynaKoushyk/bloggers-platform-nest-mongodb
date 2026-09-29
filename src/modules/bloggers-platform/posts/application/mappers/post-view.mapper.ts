import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { LikeStatus } from '../../../likes/domain/enums/like-status.enum';
import { PostReadModel } from '../read-models/post.read-model';
import { LikeDetailsViewDto } from '../../../likes/api/view-dto/like-details.view-dto';

export class PostViewMapper {
  static toView(
    post: PostReadModel,
    newestLikes: LikeDetailsViewDto[] = [],
  ): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.createdAt = post.createdAt;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.extendedLikesInfo = {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus: LikeStatus.None,
      newestLikes,
    };

    return dto;
  }
}
