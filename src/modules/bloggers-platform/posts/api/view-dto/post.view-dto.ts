import { ExtendedLikesInfoViewDto } from '../../../likes/api/view-dto/extended-likes-info.view-dto';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: Date;
  blogId: string;
  blogName: string;
  extendedLikesInfo: ExtendedLikesInfoViewDto;
}
