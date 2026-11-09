import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccessTokenPayload } from '../../application/types/access-token-payload.type';
import { RefreshTokenPayload } from '../../application/types/refresh-token-payload.type';
import { randomUUID } from 'crypto';
import { UserAccountsConfig } from '../../../config/user-accounts.config';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: UserAccountsConfig,
  ) {}

  async createAccessToken(userId: string): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: userId,
    };

    return await this.jwtService.signAsync(payload, {
      secret: this.config.accessTokenSecret,
      expiresIn: this.config.jwtAccessTokenExpireIn,
    });
  }

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    const payload = {
      sub: userId,
      deviceId,
    };

    const refreshTokenId = randomUUID();

    return this.jwtService.signAsync(payload, {
      secret: this.config.refreshTokenSecret,
      expiresIn: this.config.jwtRefreshTokenExpireIn,
      jwtid: refreshTokenId,
    });
  }

  decodeRefreshToken(token: string): RefreshTokenPayload {
    return this.jwtService.decode<RefreshTokenPayload>(token);
  }
}
