export type Page<TItem> = {
  items: TItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};
