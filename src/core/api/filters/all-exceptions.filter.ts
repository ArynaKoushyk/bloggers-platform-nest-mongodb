import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

import type { ApiErrorResponse } from '../types/api-error-response.type';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      if (status < 500) {
        message = exception.message;
      }
    }

    if (status >= 500) {
      this.logger.error(exception);
    }

    const body: ApiErrorResponse = {
      errorsMessages: [
        {
          message,
          field: null,
        },
      ],
    };

    if (response.headersSent) {
      response.end();
      return;
    }

    response.status(status).json(body);
  }
}
