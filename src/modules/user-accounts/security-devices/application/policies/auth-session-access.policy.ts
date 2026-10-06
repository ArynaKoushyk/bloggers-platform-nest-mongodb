import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { AuthSession } from '../../domain/auth-session.entity';

@Injectable()
export class AuthSessionAccessPolicy {
  assertCanModify(session: AuthSession, userId: string): void {
    if (session.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not the owner of this comment',
      });
    }
  }
}
