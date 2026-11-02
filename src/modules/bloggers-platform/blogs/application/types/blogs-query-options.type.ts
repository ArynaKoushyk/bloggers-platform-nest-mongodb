import type { SortDirection } from '../../../../../core/pagination/sort-direction.enum';
import type { BlogSortField } from '../enums/blog-sort-field.enum';

export type BlogsQueryOptions = {
  pageNumber: number;
  pageSize: number;
  sortBy: BlogSortField;
  sortDirection: SortDirection;
  searchNameTerm: string | null;
};
