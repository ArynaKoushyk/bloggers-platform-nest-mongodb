import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import type { AccessTokenPayload } from '../../application/types/access-token-payload.type';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  createAccessToken(userId: string): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: userId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<SignOptions['expiresIn']>(
        'JWT_ACCESS_TOKEN_EXPIRES_IN',
      ),
    });
  }

  createRefreshToken(
    userId: string,
    deviceId: string,
    refreshTokenId: string,
  ): Promise<string> {
    const payload = {
      sub: userId,
      deviceId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.getOrThrow<SignOptions['expiresIn']>(
        'JWT_REFRESH_TOKEN_EXPIRES_IN',
      ),
      jwtid: refreshTokenId,
    });
  }
}
