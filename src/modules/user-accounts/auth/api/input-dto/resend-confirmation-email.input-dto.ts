import { IsString, Matches } from 'class-validator';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';
import type { ResendConfirmationEmailDto } from '../../application/dto/resend-confirmation-email.dto';
import { authEmailConstraints } from './constants/auth-validation.constants';

export class ResendConfirmationEmailInputDto implements ResendConfirmationEmailDto {
  @Trim()
  @IsString()
  @Matches(authEmailConstraints.match)
  email: string;
}
