import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { AUTH_SESSIONS_REPOSITORY } from '../../../tokens/repository.tokens';
import { RefreshTokenPayload } from '../../application/types/refresh-token-payload.type';
import { RefreshTokenContext } from '../../application/types/refresh-token-context.type';
import { Request } from 'express';
import { type IAuthSessionsRepository } from '../../../security-devices/application/interfaces/auth-sessions.repository.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: IAuthSessionsRepository,
  ) {
    const refreshSecretKey = configService.getOrThrow<string>(
      'REFRESH_TOKEN_SECRET',
    );
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const cookies = req.cookies as {
            refreshToken?: unknown;
          };

          if (typeof cookies.refreshToken !== 'string') {
            return null;
          }

          return cookies.refreshToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: refreshSecretKey,
    });
  }
  //функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
  async validate(payload: RefreshTokenPayload): Promise<RefreshTokenContext> {
    const session = await this.authSessionsRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token is invalid',
      });
    }

    if (session.refreshTokenId !== payload.jti) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token is invalid',
      });
    }
    const currentDate = new Date();

    if (session.expirationDate <= currentDate) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token is invalid',
      });
    }

    if (session.userId !== payload.sub) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token is invalid',
      });
    }

    return {
      userId: payload.sub,
      deviceId: payload.deviceId,
      refreshTokenId: payload.jti,
      issuedAt: new Date(payload.iat * 1000),
      expirationDate: new Date(payload.exp * 1000),
    };
  }
}
