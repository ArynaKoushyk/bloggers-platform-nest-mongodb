import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { UserContextDto } from '../../application/dto/user-context.dto';
import { AccessTokenPayload } from '../../application/types/access-token-payload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
  ) {
    const accessSecretKey = configService.getOrThrow<string>(
      'ACCESS_TOKEN_SECRET',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessSecretKey,
    });
  }
  //функция принимает payload из jwt токена и возвращает то, что впоследствии будет записано в req.user
  async validate(payload: AccessTokenPayload): Promise<UserContextDto> {
    const user = await this.usersRepository.findById(payload.sub);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Unauthorized',
      });
    }

    return {
      id: user.id,
      login: user.login,
    };
  }
}
