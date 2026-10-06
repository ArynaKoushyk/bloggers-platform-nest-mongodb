import { SecurityDeviceViewDto } from '../../api/view-dto/security-device.view-dto';
import { SecurityDeviceReadModel } from '../read-models/security-device.read-model';

export class SecurityDeviceViewMapper {
  static toView(session: SecurityDeviceReadModel): SecurityDeviceViewDto {
    const dto = new SecurityDeviceViewDto();

    dto.deviceId = session.deviceId;
    dto.ip = session.ip;
    dto.title = session.title;
    dto.lastActiveDate = session.lastActiveDate;

    return dto;
  }
}
