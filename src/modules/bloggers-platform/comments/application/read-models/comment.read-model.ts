export type CommentReadModel = {
  id: string;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesCount: number;
  dislikesCount: number;
};

export type CommentsPageReadModel = {
  items: CommentReadModel[];
  totalCount: number;
  page: number;
  pageSize: number;
};
