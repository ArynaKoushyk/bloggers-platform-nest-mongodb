import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';
import type { ResetPasswordDto } from '../../application/dto/reset-password.dto';
import { authPasswordConstraints } from './constants/auth-validation.constants';

export class ResetPasswordInputDto implements ResetPasswordDto {
  @IsString()
  @Length(authPasswordConstraints.minLength, authPasswordConstraints.maxLength)
  newPassword: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  recoveryCode: string;
}
