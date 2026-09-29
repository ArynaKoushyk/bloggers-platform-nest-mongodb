import type { CurrentUserReadModel } from '../read-models/current-user.read-model';

export interface IAuthQueryRepository {
  findCurrentUserByIdOrFail(userId: string): Promise<CurrentUserReadModel>;
}
