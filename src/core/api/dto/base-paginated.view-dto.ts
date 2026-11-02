//базовый класс view модели для запросов за списком с пагинацией
export class BasePaginatedViewDto<TItem> {
  items: TItem[];
  totalCount: number;
  pagesCount: number;
  page: number;
  pageSize: number;
}
