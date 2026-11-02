import { IsString, Matches } from 'class-validator';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';
import type { RequestPasswordRecoveryDto } from '../../application/dto/request-password-recovery.dto';
import { authEmailConstraints } from './constants/auth-validation.constants';

export class RequestPasswordRecoveryInputDto implements RequestPasswordRecoveryDto {
  @Trim()
  @IsString()
  @Matches(authEmailConstraints.match)
  email: string;
}
