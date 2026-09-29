import type {
  UserReadModel,
  UsersPageReadModel,
} from '../read-models/user.read-model';

export interface UsersQueryParams {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  calculateSkip(): number;
}

export interface IUsersQueryRepository {
  findAll(query: UsersQueryParams): Promise<UsersPageReadModel>;
  findByIdOrFail(id: string): Promise<UserReadModel>;
}
