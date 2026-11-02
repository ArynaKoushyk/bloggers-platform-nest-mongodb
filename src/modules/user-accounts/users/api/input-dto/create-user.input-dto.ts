import { IsString, Length, Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/api/decorators/validation/is-string-with-trim.decorator';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import {
  emailConstraints,
  loginConstraints,
  passwordConstraints,
} from './constants/user-validation.constants';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';

export class CreateUserInputDto implements CreateUserDto {
  @IsStringWithTrim(loginConstraints.minLength, loginConstraints.maxLength)
  @Matches(loginConstraints.match)
  login: string;

  @Trim()
  @IsString()
  @Matches(emailConstraints.match)
  email: string;

  @IsString()
  @Length(passwordConstraints.minLength, passwordConstraints.maxLength)
  password: string;
}
