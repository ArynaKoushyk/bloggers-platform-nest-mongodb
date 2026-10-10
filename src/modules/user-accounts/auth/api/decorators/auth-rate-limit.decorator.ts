import { applyDecorators, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

export const AuthRateLimit = () => applyDecorators(UseGuards(ThrottlerGuard));
