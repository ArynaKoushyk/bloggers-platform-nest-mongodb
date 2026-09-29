import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/param/current-user.decorator';
import { UserContextDto } from '../application/dto/user-context.dto';
import { CurrentUserViewDto } from './view-dto/current-user.view-dto';
import { JwtAuthGuard } from '../guards/jwt/jwt-auth.guard';
import { RegisterUserInputDto } from './input-dto/register-user.input-dto';
import { ResendRegistrationConfirmationEmailInputDto } from './input-dto/resend-registration-confirmation-email.input-dto';
import { ConfirmRegistrationInputDto } from './input-dto/confirm-registration.input-dto';
import { StartPasswordRecoveryInputDto } from './input-dto/start-password-recovery.input-dto';
import { ResetPasswordInputDto } from './input-dto/reset-password.input-dto';
import { LoginSuccessViewDto } from './view-dto/login-success.view-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { ResendConfirmationEmailCommand } from '../application/usecases/resend-confirmation-email.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/confirm-registration.usecase';
import { RequestPasswordRecoveryCommand } from '../application/usecases/request-password-recovery.usecase';
import { ResetPasswordCommand } from '../application/usecases/reset-password.usecase';
import { GetCurrentUserQuery } from '../application/queries/get-current-user.query-handler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService: AuthService,
  ) {}

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  registerUser(@Body() dto: RegisterUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(dto));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // не использую passport local потому что хочу четко разделять оишбки валидации 400 и авторизации 401
  async login(@Body() dto: LoginInputDto): Promise<LoginSuccessViewDto> {
    const user = await this.authService.validateCredentials(
      dto.loginOrEmail,
      dto.password,
    );

    return this.commandBus.execute(new LoginUserCommand(user.id));
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  resendRegistrationConfirmationEmail(
    @Body() dto: ResendRegistrationConfirmationEmailInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new ResendConfirmationEmailCommand(dto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  confirmRegistration(@Body() dto: ConfirmRegistrationInputDto): Promise<void> {
    return this.commandBus.execute(new ConfirmRegistrationCommand(dto));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  startPasswordRecovery(
    @Body() dto: StartPasswordRecoveryInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RequestPasswordRecoveryCommand(dto));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() dto: ResetPasswordInputDto): Promise<void> {
    return this.commandBus.execute(new ResetPasswordCommand(dto));
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(
    @CurrentUser() user: UserContextDto,
  ): Promise<CurrentUserViewDto> {
    return this.queryBus.execute(new GetCurrentUserQuery(user.id));
  }
}
