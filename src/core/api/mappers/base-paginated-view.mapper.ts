import type { BasePaginatedViewDto } from '../dto/base-paginated.view-dto';
import type { Page } from '../../types/page.type';

export class BasePaginatedViewMapper {
  static mapToView<TItem>(page: Page<TItem>): BasePaginatedViewDto<TItem> {
    return {
      totalCount: page.totalCount,
      pagesCount: Math.ceil(page.totalCount / page.pageSize),
      page: page.page,
      pageSize: page.pageSize,
      items: page.items,
    };
  }
}
