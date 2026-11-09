import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsUrl } from 'class-validator';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class NotificationsConfig {
  @IsNotEmpty({
    message: 'Set Env variable GMAIL_USER',
  })
  readonly gmailUser: string;

  @IsNotEmpty({
    message: 'Set Env variable GMAIL_APP_PASSWORD',
  })
  readonly gmailAppPassword: string;

  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_tld: false,
    },
    { message: 'FRONTEND_URL must be a valid HTTP or HTTPS URL' },
  )
  readonly frontendUrl: string;

  constructor(configService: ConfigService) {
    this.gmailUser = configService.getOrThrow<string>('GMAIL_USER');
    this.gmailAppPassword =
      configService.getOrThrow<string>('GMAIL_APP_PASSWORD');
    this.frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');
    configValidationUtility.validateConfig(this);
  }
}
