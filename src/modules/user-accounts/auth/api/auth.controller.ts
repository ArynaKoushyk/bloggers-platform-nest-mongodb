import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Res,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/param/current-user.decorator';
import type { AuthenticatedUser } from '../application/types/authenticated-user.type';
import { CurrentUserViewDto } from './view-dto/current-user.view-dto';
import { JwtAuthGuard } from '../guards/jwt/jwt-auth.guard';
import { RegisterUserInputDto } from './input-dto/register-user.input-dto';
import { ResendConfirmationEmailInputDto } from './input-dto/resend-confirmation-email.input-dto';
import { ConfirmRegistrationInputDto } from './input-dto/confirm-registration.input-dto';
import { RequestPasswordRecoveryInputDto } from './input-dto/request-password-recovery.input-dto';
import { ResetPasswordInputDto } from './input-dto/reset-password.input-dto';
import { AccessTokenViewDto } from './view-dto/access-token.view-dto';
import { LoginInputDto } from './input-dto/login.input-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { ResendConfirmationEmailCommand } from '../application/usecases/resend-confirmation-email.usecase';
import { ConfirmRegistrationCommand } from '../application/usecases/confirm-registration.usecase';
import { RequestPasswordRecoveryCommand } from '../application/usecases/request-password-recovery.usecase';
import { ResetPasswordCommand } from '../application/usecases/reset-password.usecase';
import { GetCurrentUserQuery } from '../application/queries/get-current-user.query-handler';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenAuthGuard } from '../guards/jwt/refresh-token-auth.guard';
import { CurrentRefreshTokenContext } from '../decorators/param/current-refresh-token-context.decorator';
import { type RefreshTokenContext } from '../application/types/refresh-token-context.type';
import { RefreshTokensCommand } from '../application/usecases/refresh-tokens.usecase';
import { LogoutUserCommand } from '../application/usecases/logout-user.usecase';
import { AuthRateLimit } from './decorators/auth-rate-limit.decorator';
import { UserAccountsConfig } from '../../config/user-accounts.config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly config: UserAccountsConfig,
  ) {}

  @AuthRateLimit()
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  registerUser(@Body() dto: RegisterUserInputDto): Promise<void> {
    return this.commandBus.execute(new RegisterUserCommand(dto));
  }

  @AuthRateLimit()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // не использую passport local потому что хочу четко разделять оишбки валидации 400 и авторизации 401
  async login(
    @Body() dto: LoginInputDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenViewDto> {
    const loginResult = await this.commandBus.execute(
      new LoginUserCommand(dto.loginOrEmail, dto.password, ip, userAgent),
    );

    const refreshTokenCookieMaxAge = this.config.refreshTokenCookieMaxAgeMs;
    response.cookie('refreshToken', loginResult.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: refreshTokenCookieMaxAge,
    });
    return { accessToken: loginResult.accessToken };
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @CurrentRefreshTokenContext() user: RefreshTokenContext,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenViewDto> {
    const result = await this.commandBus.execute(
      new RefreshTokensCommand(user),
    );

    const refreshTokenCookieMaxAge = this.config.refreshTokenCookieMaxAgeMs;
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: refreshTokenCookieMaxAge,
    });
    return { accessToken: result.accessToken };
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentRefreshTokenContext()
    context: RefreshTokenContext,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutUserCommand(
        context.userId,
        context.deviceId,
        context.refreshTokenId,
      ),
    );

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });
  }

  @AuthRateLimit()
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  resendConfirmationEmail(
    @Body() dto: ResendConfirmationEmailInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new ResendConfirmationEmailCommand(dto));
  }

  @AuthRateLimit()
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  confirmRegistration(@Body() dto: ConfirmRegistrationInputDto): Promise<void> {
    return this.commandBus.execute(new ConfirmRegistrationCommand(dto));
  }

  @AuthRateLimit()
  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  requestPasswordRecovery(
    @Body() dto: RequestPasswordRecoveryInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new RequestPasswordRecoveryCommand(dto));
  }

  @AuthRateLimit()
  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() dto: ResetPasswordInputDto): Promise<void> {
    return this.commandBus.execute(new ResetPasswordCommand(dto));
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CurrentUserViewDto> {
    return this.queryBus.execute(new GetCurrentUserQuery(user.userId));
  }
}
