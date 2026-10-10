import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './exceptions/filters/all-exceptions.filter';
import { DomainExceptionFilter } from './exceptions/filters/domain-exception.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  AUTH_RATE_LIMIT_TTL,
} from './rate-limit/rate-limit.constants';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: AUTH_RATE_LIMIT_TTL,
          limit: AUTH_RATE_LIMIT_MAX_REQUESTS,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
})
export class CoreModule {}
