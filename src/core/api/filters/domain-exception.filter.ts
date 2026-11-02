import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import { DomainException } from '../../exceptions/domain.exception';
import { DomainExceptionCode } from '../../exceptions/domain-exception-code.enum';
import type { ApiErrorResponse } from '../types/api-error-response.type';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.mapToHttpStatus(exception.code);

    const body: ApiErrorResponse = {
      errorsMessages: exception.errorsMessages,
    };

    if (status >= 500) {
      this.logger.error(exception);

      body.errorsMessages = [
        {
          message: 'Internal server error',
          field: null,
        },
      ];
    }

    if (response.headersSent) {
      response.end();
      return;
    }

    response.status(status).json(body);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;

      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;

      case DomainExceptionCode.Conflict:
        return HttpStatus.CONFLICT;

      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
