import type { User } from '../../domain/user.entity';

export type UserWithId = User & {
  readonly id: string;
};

export interface IUsersRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<UserWithId | null>;
  findByIdOrFail(id: string): Promise<UserWithId>;
  findByLogin(login: string): Promise<UserWithId | null>;
  findByEmail(email: string): Promise<UserWithId | null>;
  findByLoginOrEmail(loginOrEmail: string): Promise<UserWithId | null>;
  findByConfirmationCode(code: string): Promise<UserWithId | null>;
  findByRecoveryCode(recoveryCode: string): Promise<UserWithId | null>;
}
