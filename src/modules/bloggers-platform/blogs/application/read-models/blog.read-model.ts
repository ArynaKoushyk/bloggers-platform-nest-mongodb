export type BlogReadModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
};

export type BlogsPageReadModel = {
  items: BlogReadModel[];
  totalCount: number;
  page: number;
  pageSize: number;
};
