import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import { AuthTokensResult } from '../types/auth-tokens-result.type';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';
import { AUTH_SESSIONS_REPOSITORY } from '../../../tokens/repository.tokens';
import type { IAuthSessionsRepository } from '../../../security-devices/application/interfaces/auth-sessions.repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuthSession,
  type AuthSessionModelType,
} from '../../../security-devices/domain/auth-session.entity';
import { CreateAuthSessionDomainDto } from '../../../security-devices/domain/dto/create-auth-session.domain.dto';
import { AuthService } from '../auth.service';

export class LoginUserCommand extends Command<AuthTokensResult> {
  constructor(
    public readonly loginOrEmail: string,
    public readonly password: string,
    public readonly ip: string,
    public readonly title: string,
  ) {
    super();
  }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    @Inject(AUTH_SESSIONS_REPOSITORY)
    private readonly authSessionsRepository: IAuthSessionsRepository,
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: AuthSessionModelType,
    private readonly authService: AuthService,
  ) {}

  async execute({
    loginOrEmail,
    password,
    ip,
    title,
  }: LoginUserCommand): Promise<AuthTokensResult> {
    const user = await this.authService.validateCredentials(
      loginOrEmail,
      password,
    );

    const accessToken = await this.jwtAdapter.createAccessToken(user.id);
    const deviceId = randomUUID();
    const refreshToken = await this.jwtAdapter.createRefreshToken(
      user.id,
      deviceId,
    );

    const refreshTokenPayload =
      this.jwtAdapter.decodeRefreshToken(refreshToken);

    const { iat, exp, jti } = refreshTokenPayload;

    const lastActiveDate = new Date(iat * 1000);
    const expirationDate = new Date(exp * 1000);

    const sessionData: CreateAuthSessionDomainDto = {
      userId: user.id,
      deviceId,
      ip,
      title,
      lastActiveDate,
      expirationDate,
      refreshTokenId: jti,
    };
    const session = this.authSessionModel.createInstance(sessionData);
    await this.authSessionsRepository.save(session);
    return {
      accessToken,
      refreshToken,
    };
  }
}
