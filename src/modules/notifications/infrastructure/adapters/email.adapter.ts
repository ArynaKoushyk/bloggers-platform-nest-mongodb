import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationsConfig } from '../../config/notifications.config';

@Injectable()
export class EmailAdapter {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: NotificationsConfig,
  ) {}

  async sendRegistrationConfirmation(
    email: string,
    confirmationCode: string,
  ): Promise<void> {
    const frontendUrl = this.config.frontendUrl;

    const confirmationUrl = new URL('/confirm-registration', frontendUrl);
    confirmationUrl.searchParams.set('code', confirmationCode);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Registration confirmation',
      template: 'registration-confirmation',
      context: {
        confirmationUrl: confirmationUrl.toString(),
      },
      text: `Confirm your registration: ` + confirmationUrl.toString(),
    });
  }

  async sendPasswordRecovery(
    email: string,
    recoveryCode: string,
  ): Promise<void> {
    const frontendUrl = this.config.frontendUrl;

    const recoveryUrl = new URL('/password-recovery', frontendUrl);
    recoveryUrl.searchParams.set('recoveryCode', recoveryCode);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password recovery',
      template: 'password-recovery',
      context: {
        recoveryUrl: recoveryUrl.toString(),
      },
      text: `Reset your password: ` + recoveryUrl.toString(),
    });
  }
}
