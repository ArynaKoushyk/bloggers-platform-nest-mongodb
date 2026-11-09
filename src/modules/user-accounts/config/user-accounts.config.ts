import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsInt, IsNotEmpty, Matches, Min } from 'class-validator';
import type { SignOptions } from 'jsonwebtoken';
import { configValidationUtility } from '../../../setup/config-validation.utility';

type JwtDuration = Extract<SignOptions['expiresIn'], string>;

const JWT_DURATION_PATTERN =
  /^(?:\d+(?:\.\d+)?|\.\d+) *(?:milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({ message: 'Set Env variable ADMIN_LOGIN' })
  readonly adminLogin: string;

  @IsNotEmpty({ message: 'Set Env variable ADMIN_PASSWORD' })
  readonly adminPassword: string;

  @Matches(JWT_DURATION_PATTERN, {
    message:
      'JWT_ACCESS_TOKEN_EXPIRES_IN must include a time unit, for example 5m',
  })
  readonly jwtAccessTokenExpireIn: JwtDuration;

  @Matches(JWT_DURATION_PATTERN, {
    message:
      'JWT_REFRESH_TOKEN_EXPIRES_IN must include a time unit, for example 2d',
  })
  readonly jwtRefreshTokenExpireIn: JwtDuration;

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET',
  })
  readonly refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET',
  })
  readonly accessTokenSecret: string;

  @IsInt({ message: 'CONFIRMATION_CODE_TTL_SECONDS must be an integer' })
  @Min(1)
  readonly confirmationCodeTtlSeconds: number;

  @IsInt({ message: 'RECOVERY_CODE_TTL_SECONDS must be an integer' })
  @Min(1)
  readonly recoveryCodeTtlSeconds: number;

  @IsInt({ message: 'REFRESH_TOKEN_COOKIE_MAX_AGE_MS must be an integer' })
  @Min(1)
  readonly refreshTokenCookieMaxAgeMs: number;

  constructor(configService: ConfigService) {
    this.adminLogin = configService.getOrThrow<string>('ADMIN_LOGIN');
    this.adminPassword = configService.getOrThrow<string>('ADMIN_PASSWORD');
    this.jwtAccessTokenExpireIn = configService.getOrThrow<JwtDuration>(
      'JWT_ACCESS_TOKEN_EXPIRES_IN',
    );
    this.jwtRefreshTokenExpireIn = configService.getOrThrow<JwtDuration>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN',
    );
    this.refreshTokenSecret = configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );
    this.accessTokenSecret = configService.getOrThrow<string>(
      'ACCESS_TOKEN_SECRET',
    );
    this.confirmationCodeTtlSeconds = Number(
      configService.getOrThrow<string>('CONFIRMATION_CODE_TTL_SECONDS'),
    );
    this.recoveryCodeTtlSeconds = Number(
      configService.getOrThrow<string>('RECOVERY_CODE_TTL_SECONDS'),
    );
    this.refreshTokenCookieMaxAgeMs = Number(
      configService.getOrThrow<string>('REFRESH_TOKEN_COOKIE_MAX_AGE_MS'),
    );
    configValidationUtility.validateConfig(this);
  }
}
