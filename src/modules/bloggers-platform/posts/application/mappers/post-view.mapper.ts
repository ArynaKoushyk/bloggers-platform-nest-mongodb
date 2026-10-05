import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { LikeStatus } from '../../../likes/domain/enums/like-status.enum';
import { PostReadModel } from '../read-models/post.read-model';
import { LikeDetailsViewMapper } from '../../../likes/application/mappers/like-details-view.mapper';
import { LikeDetailsReadModel } from '../../../likes/application/read-models/like.read-model';

export class PostViewMapper {
  static toView(
    post: PostReadModel,
    myStatus: LikeStatus = LikeStatus.None,
    newestLikes: LikeDetailsReadModel[] | undefined = [],
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
      myStatus,
      newestLikes: newestLikes.map((like) =>
        LikeDetailsViewMapper.toView(like),
      ),
    };

    return dto;
  }
}
