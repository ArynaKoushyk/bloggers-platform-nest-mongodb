import type { FieldError } from '../../exceptions/field-error.type';

export type ApiErrorResponse = {
  errorsMessages: FieldError[] | null;
};
