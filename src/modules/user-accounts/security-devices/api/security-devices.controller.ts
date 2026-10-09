import {
  Controller,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import { RefreshTokenAuthGuard } from '../../auth/guards/jwt/refresh-token-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentRefreshTokenContext } from '../../auth/decorators/param/current-refresh-token-context.decorator';
import { type RefreshTokenContext } from '../../auth/application/types/refresh-token-context.type';
import { TerminateOtherDeviceSessionsCommand } from '../application/usecases/terminate-other-device-sessions.usecase';
import { TerminateDeviceSessionCommand } from '../application/usecases/terminate-device-session.usecase';
import { SecurityDeviceViewDto } from './view-dto/security-device.view-dto';
import { GetSecurityDevicesQuery } from '../application/queries/get-security-devices.query-handler';

@UseGuards(RefreshTokenAuthGuard)
@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getSecurityDevices(
    @CurrentRefreshTokenContext()
    context: RefreshTokenContext,
  ): Promise<SecurityDeviceViewDto[]> {
    return this.queryBus.execute(new GetSecurityDevicesQuery(context.userId));
  }
  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  terminateDeviceSession(
    @Param('deviceId') deviceId: string,
    @CurrentRefreshTokenContext()
    context: RefreshTokenContext,
  ): Promise<void> {
    return this.commandBus.execute(
      new TerminateDeviceSessionCommand(context.userId, deviceId),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  terminateOtherDeviceSessions(
    @CurrentRefreshTokenContext()
    context: RefreshTokenContext,
  ): Promise<void> {
    return this.commandBus.execute(
      new TerminateOtherDeviceSessionsCommand(context.userId, context.deviceId),
    );
  }
}
