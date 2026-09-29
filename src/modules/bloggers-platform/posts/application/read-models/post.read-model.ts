export type PostReadModel = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: Date;
  blogId: string;
  blogName: string;
  likesCount: number;
  dislikesCount: number;
};

export type PostsPageReadModel = {
  items: PostReadModel[];
  totalCount: number;
  page: number;
  pageSize: number;
};
