export type UserReadModel = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
};

export type UsersPageReadModel = {
  items: UserReadModel[];
  totalCount: number;
  page: number;
  pageSize: number;
};
