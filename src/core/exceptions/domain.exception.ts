import { DomainExceptionCode } from './domain-exception-code.enum';
import type { FieldError } from './field-error.type';

export class DomainException extends Error {
  readonly code: DomainExceptionCode;
  readonly errorsMessages: FieldError[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    errorsMessages: FieldError[];
  }) {
    super(errorInfo.errorsMessages[0]?.message ?? 'Application error');
    this.name = DomainException.name;
    this.code = errorInfo.code;
    this.errorsMessages = errorInfo.errorsMessages;
  }
}
