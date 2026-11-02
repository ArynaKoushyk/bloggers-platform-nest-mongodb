import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';

export class LoginInputDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  loginOrEmail: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
