import { IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';
import { IsStringWithTrim } from '../../../../../core/api/decorators/validation/is-string-with-trim.decorator';
import type { RegisterUserDto } from '../../application/dto/register-user.dto';
import {
  authEmailConstraints,
  authLoginConstraints,
  authPasswordConstraints,
} from './constants/auth-validation.constants';

export class RegisterUserInputDto implements RegisterUserDto {
  @IsStringWithTrim(
    authLoginConstraints.minLength,
    authLoginConstraints.maxLength,
  )
  @Matches(authLoginConstraints.match)
  login: string;

  @Trim()
  @IsString()
  @Matches(authEmailConstraints.match)
  email: string;

  @IsString()
  @Length(authPasswordConstraints.minLength, authPasswordConstraints.maxLength)
  password: string;
}
