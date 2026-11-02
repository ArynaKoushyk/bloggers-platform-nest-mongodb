import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { DomainException } from '../../exceptions/domain.exception';
import { DomainExceptionCode } from '../../exceptions/domain-exception-code.enum';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<
  string,
  string | Types.ObjectId
> {
  transform(
    value: string,
    metadata: ArgumentMetadata,
  ): string | Types.ObjectId {
    if (metadata.metatype !== Types.ObjectId) {
      return value;
    }

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

    return new Types.ObjectId(value);
  }
}
