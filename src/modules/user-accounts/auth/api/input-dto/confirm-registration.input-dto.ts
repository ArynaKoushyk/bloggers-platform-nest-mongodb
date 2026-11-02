import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../../core/api/decorators/transform/trim.decorator';
import type { ConfirmRegistrationDto } from '../../application/dto/confirm-registration.dto';

export class ConfirmRegistrationInputDto implements ConfirmRegistrationDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  code: string;
}
