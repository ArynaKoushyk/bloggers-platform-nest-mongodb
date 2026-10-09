import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { SECURITY_DEVICES_QUERY_REPOSITORY } from '../../../tokens/repository.tokens';
import { Inject } from '@nestjs/common';
import { SecurityDeviceViewDto } from '../../api/view-dto/security-device.view-dto';
import { type ISecurityDevicesQueryRepository } from '../interfaces/security-devices.query-repository.interface';
import { SecurityDeviceViewMapper } from '../mappers/security-device-view.mapper';

export class GetSecurityDevicesQuery extends Query<SecurityDeviceViewDto[]> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetSecurityDevicesQuery)
export class GetSecurityDevicesQueryHandler implements IQueryHandler<GetSecurityDevicesQuery> {
  constructor(
    @Inject(SECURITY_DEVICES_QUERY_REPOSITORY)
    private readonly securityDevicesQueryRepository: ISecurityDevicesQueryRepository,
  ) {}

  async execute({
    userId,
  }: GetSecurityDevicesQuery): Promise<SecurityDeviceViewDto[]> {
    const currentDate = new Date();

    const devices =
      await this.securityDevicesQueryRepository.findAllActiveDevicesByUserId(
        userId,
        currentDate,
      );

    return devices.map((device) => SecurityDeviceViewMapper.toView(device));
  }
}
