import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UserContextDto } from '../../application/dto/user-context.dto';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '../../application/types/access-token-payload.type';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import type { IUsersRepository } from '../../../users/application/interfaces/users.repository.interface';
import { USERS_REPOSITORY } from '../../../tokens/repository.tokens';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
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
