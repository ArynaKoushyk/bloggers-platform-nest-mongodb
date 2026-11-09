import { NotificationsConfigModule } from './config/notifications-config.module';
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'node:path';
import { SendConfirmationEmailHandler } from './application/event-handlers/send-confirmation-email.handler';
import { SendRecoveryEmailHandler } from './application/event-handlers/send-recovery-email.handler';
import { NotificationsConfig } from './config/notifications.config';

const eventHandlers = [SendConfirmationEmailHandler, SendRecoveryEmailHandler];

@Module({
  imports: [
    NotificationsConfigModule,
    MailerModule.forRootAsync({
      imports: [NotificationsConfigModule],
      inject: [NotificationsConfig],
      useFactory: (config: NotificationsConfig) => ({
        transport: {
          port: 465,
          secure: true,
          service: 'gmail',
          auth: {
            user: config.gmailUser,
            pass: config.gmailAppPassword,
          },
        },
        defaults: {
          from: `"Bloggers Platform" <${config.gmailUser}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailAdapter, ...eventHandlers],
})
export class NotificationsModule {}
