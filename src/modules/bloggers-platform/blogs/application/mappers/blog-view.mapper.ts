import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogReadModel } from '../read-models/blog.read-model';

export class BlogViewMapper {
  static toView(blog: BlogReadModel): BlogViewDto {
    const dto = new BlogViewDto();

    dto.id = blog.id;
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;

    return dto;
  }
}
