import {
  Injectable,
  PipeTransform,
  type ArgumentMetadata,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { DomainException } from '../../exceptions/domain.exception';
import { DomainExceptionCode } from '../../exceptions/domain-exception-code.enum';

/**
 * Not add it globally. Use only locally.
 */
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        errorsMessages: [
          {
            field: metadata.data ?? null,
            message: `Invalid ObjectId: ${value}`,
          },
        ],
      });
    }

    return value;
  }
}
