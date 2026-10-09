import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthSession,
  AuthSessionDocument,
  type AuthSessionModelType,
} from '../../domain/auth-session.entity';
import { IAuthSessionsRepository } from '../../application/interfaces/auth-sessions.repository.interface';

@Injectable()
export class AuthSessionsRepository implements IAuthSessionsRepository {
  constructor(
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: AuthSessionModelType,
  ) {}
  async findByDeviceId(deviceId: string): Promise<AuthSessionDocument | null> {
    return await this.authSessionModel.findOne({ deviceId }).exec();
  }

  async save(doc: AuthSessionDocument): Promise<void> {
    await doc.save();
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.authSessionModel.deleteOne({ deviceId }).exec();
  }

  async deleteCurrentSession(
    userId: string,
    deviceId: string,
    refreshTokenId: string,
  ): Promise<void> {
    await this.authSessionModel
      .deleteOne({
        userId,
        deviceId,
        refreshTokenId,
      })
      .exec();
  }
  async deleteAllOtherSessionsForUser(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await this.authSessionModel
      .deleteMany({
        userId,
        deviceId: { $ne: currentDeviceId },
      })
      .exec();
  }
}
