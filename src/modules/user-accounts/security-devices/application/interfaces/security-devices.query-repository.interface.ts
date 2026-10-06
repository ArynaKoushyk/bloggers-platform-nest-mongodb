import type { SecurityDeviceReadModel } from '../read-models/security-device.read-model';

export interface ISecurityDevicesQueryRepository {
  findAllActiveDevicesByUserId(
    userId: string,
    currentDate: Date,
  ): Promise<SecurityDeviceReadModel[]>;
}
