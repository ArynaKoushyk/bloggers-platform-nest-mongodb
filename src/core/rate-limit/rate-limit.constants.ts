import { seconds } from '@nestjs/throttler';

export const AUTH_RATE_LIMIT_MAX_REQUESTS = 5;
export const AUTH_RATE_LIMIT_TTL = seconds(10);
