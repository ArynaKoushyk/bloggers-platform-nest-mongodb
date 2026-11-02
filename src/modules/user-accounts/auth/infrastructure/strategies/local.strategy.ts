import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import type { AuthenticatedUser } from '../../application/types/authenticated-user.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.authService.validateCredentials(
      loginOrEmail,
      password,
    );

    return user;
  }
}
