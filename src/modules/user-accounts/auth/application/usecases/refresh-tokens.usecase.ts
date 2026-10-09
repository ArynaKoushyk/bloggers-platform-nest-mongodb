import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthTokensResult } from '../types/auth-tokens-result.type';
import { Inject } from '@nestjs/common';
import type { IAuthSessionsRepository } from '../../../security-devices/application/interfaces/auth-sessions.repository.interface';
import { AUTH_SESSIONS_REPOSITORY } from '../../../tokens/repository.tokens';
import { AuthSessionAccessPolicy } from '../../../security-devices/application/policies/auth-session-access.policy';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import { RefreshTokenContext } from '../types/refresh-token-context.type';

export class RefreshTokensCommand extends Command<AuthTokensResult> {
  constructor(public readonly context: RefreshTokenContext) {
    super();
  }
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase implements ICommandHandler<RefreshTokensCommand> {
  constructor(
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: IAuthSessionsRepository,
    private readonly authSessionAccessPolicy: AuthSessionAccessPolicy,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async execute({ context }: RefreshTokensCommand): Promise<AuthTokensResult> {
    const session = await this.authSessionsRepository.findByDeviceId(
      context.deviceId,
    );

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token is invalid',
      });
    }

    //this.authSessionAccessPolicy.assertCanModify(session, context.userId);

    const currentDate = new Date();

    const newAccessToken = await this.jwtAdapter.createAccessToken(
      context.userId,
    );
    const newRefreshToken = await this.jwtAdapter.createRefreshToken(
      context.userId,
      context.deviceId,
    );

    const newRefreshTokenPayload =
      this.jwtAdapter.decodeRefreshToken(newRefreshToken);

    const refreshTokenData = {
      refreshTokenId: newRefreshTokenPayload.jti,
      lastActiveDate: new Date(newRefreshTokenPayload.iat * 1000),
      expirationDate: new Date(newRefreshTokenPayload.exp * 1000),
    };

    const rotationResult = session.rotateRefreshToken(
      context.refreshTokenId,
      currentDate,
      refreshTokenData,
    );

    if (rotationResult !== null) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: `Refresh token rotation failed: ${rotationResult}`,
      });
    }

    await this.authSessionsRepository.save(session);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
