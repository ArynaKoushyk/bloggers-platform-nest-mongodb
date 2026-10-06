import { SecurityDeviceReadModel } from '../../application/read-models/security-device.read-model';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthSession,
  type AuthSessionModelType,
} from '../../domain/auth-session.entity';
import { Injectable } from '@nestjs/common';
import { ISecurityDevicesQueryRepository } from '../../application/interfaces/security-devices.query-repository.interface';

@Injectable()
export class SecurityDevicesQueryRepository implements ISecurityDevicesQueryRepository {
  constructor(
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: AuthSessionModelType,
  ) {}
  async findAllActiveDevicesByUserId(
    userId: string,
    currentDate: Date,
  ): Promise<SecurityDeviceReadModel[]> {
    const sessions = await this.authSessionModel
      .find({ userId, expirationDate: { $gt: currentDate } })
      .select({
        _id: 0,
        deviceId: 1,
        ip: 1,
        title: 1,
        lastActiveDate: 1,
      })
      .lean()
      .exec();
    return sessions;
  }
}
