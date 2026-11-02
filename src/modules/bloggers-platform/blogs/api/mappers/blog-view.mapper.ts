import { BlogViewDto } from '../view-dto/blog.view-dto';
import type { BlogReadModel } from '../../application/read-models/blog.read-model';
import type { Page } from '../../../../../core/types/page.type';
import type { BasePaginatedViewDto } from '../../../../../core/api/dto/base-paginated.view-dto';
import { BasePaginatedViewMapper } from '../../../../../core/api/mappers/base-paginated-view.mapper';

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

  static toPageView(
    result: Page<BlogReadModel>,
  ): BasePaginatedViewDto<BlogViewDto> {
    return BasePaginatedViewMapper.mapToView({
      ...result,
      items: result.items.map((blog) => this.toView(blog)),
    });
  }
}
