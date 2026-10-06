import type { AuthSessionDocument } from '../../domain/auth-session.entity';

export interface IAuthSessionsRepository {
  findByDeviceId(deviceId: string): Promise<AuthSessionDocument | null>;
  save(session: AuthSessionDocument): Promise<void>;
  deleteByDeviceId(deviceId: string): Promise<void>;
  deleteAllOtherSessionsForUser(
    userId: string,
    currentDeviceId: string,
  ): Promise<void>;
}
