import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';

import { ParseObjectIdPipe } from '../core/api/pipes/parse-object-id.pipe';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-code.enum';
import type { FieldError } from '../core/exceptions/field-error.type';
import { DomainException } from '../core/exceptions/domain.exception';

//функция использует рекурсию для обхода объекта children при вложенных полях при валидации

export const formatValidationErrors = (
  errors: ValidationError[],
  parentPath = '',
): FieldError[] => {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const message = error.constraints
      ? Object.values(error.constraints)[0]
      : undefined;

    const currentError: FieldError[] = message ? [{ field, message }] : [];
    const childErrors = formatValidationErrors(error.children ?? [], field);

    return [...currentError, ...childErrors];
  });
};

export function setupGlobalPipes(app: INestApplication): void {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,

      whitelist: true,
      //Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors: ValidationError[]) =>
        new DomainException({
          code: DomainExceptionCode.ValidationError,
          errorsMessages: formatValidationErrors(errors),
        }),
    }),
    // ObjectId создаём после валидации, чтобы whitelist не удалял его данные.
    new ParseObjectIdPipe(),
  );
}
