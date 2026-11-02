import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
  UseGuards,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { LoginInputDto } from '../../../modules/user-accounts/auth/api/input-dto/login.input-dto';
import { setupGlobalPipes } from '../../../setup/pipes.setup';
import { CoreModule } from '../../core.module';
import { DomainExceptionCode } from '../../exceptions/domain-exception-code.enum';
import { DomainException } from '../../exceptions/domain.exception';
import { IsStringWithTrim } from '../decorators/validation/is-string-with-trim.decorator';
import { ObjectIdValidationPipe } from '../pipes/object-id-validation.pipe';

class CommentInputDto {
  @IsStringWithTrim(1, 300)
  content: string;
}

class NestedInputDto {
  @ValidateNested()
  @Type(() => CommentInputDto)
  comment: CommentInputDto;
}

@Controller('core-errors')
class CoreErrorsController {
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginInputDto): { accessToken: string } {
    if (dto.loginOrEmail === 'member' && dto.password === 'correct-password') {
      return { accessToken: 'test-token' };
    }

    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      errorsMessages: [{ field: null, message: 'Unauthorized' }],
    });
  }

  @Post('comment')
  @HttpCode(204)
  comment(@Body() dto: CommentInputDto): void {
    void dto;
  }

  @Post('nested')
  @HttpCode(204)
  nested(@Body() dto: NestedInputDto): void {
    void dto;
  }

  @Get('business-validation')
  businessValidation(): never {
    throw new DomainException({
      code: DomainExceptionCode.BadRequest,
      errorsMessages: [
        { field: 'recoveryCode', message: 'Recovery code is invalid' },
      ],
    });
  }

  @Get('expired-code')
  expiredCode(): never {
    throw new DomainException({
      code: DomainExceptionCode.ConfirmationCodeExpired,
      errorsMessages: [
        { field: 'code', message: 'Confirmation code is expired' },
      ],
    });
  }

  @Get('bad-request')
  badRequest(): never {
    throw new BadRequestException('The request is invalid');
  }

  @Get('multiple-field-errors')
  multipleFieldErrors(): never {
    throw new DomainException({
      code: DomainExceptionCode.ValidationError,
      errorsMessages: [
        { field: 'login', message: 'Login is invalid' },
        { field: 'email', message: 'Email is invalid' },
      ],
    });
  }

  @Get('unauthorized')
  unauthorized(): never {
    throw new UnauthorizedException();
  }

  @Get('missing')
  missing(): never {
    throw new DomainException({
      code: DomainExceptionCode.NotFound,
      errorsMessages: [{ field: null, message: 'Comment not found' }],
    });
  }

  @Get('forbidden')
  forbidden(): never {
    throw new DomainException({
      code: DomainExceptionCode.Forbidden,
      errorsMessages: [{ field: null, message: 'Access denied' }],
    });
  }

  @Get('limited')
  @UseGuards(ThrottlerGuard)
  limited(): string {
    return 'ok';
  }

  @Get('comments/:commentId')
  commentId(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
  ): string {
    return commentId;
  }

  @Get('object-ids/:id')
  objectId(@Param('id') id: Types.ObjectId): { id: string } {
    return { id: id.toHexString() };
  }

  @Get('unexpected')
  unexpected(): never {
    throw new Error('Database connection contains private details');
  }

  @Get('domain-server-error')
  domainServerError(): never {
    throw new DomainException({
      code: DomainExceptionCode.InternalServerError,
      errorsMessages: [{ field: null, message: 'Private domain failure' }],
    });
  }

  @Get('unavailable')
  unavailable(): never {
    throw new ServiceUnavailableException('Private dependency details');
  }

  @Get('unmapped-code')
  unmappedCode(): never {
    throw new DomainException({
      code: 'UnmappedCode' as DomainExceptionCode,
      errorsMessages: [{ field: null, message: 'Private unmapped failure' }],
    });
  }
}

function expectBody(expected: unknown) {
  return (response: { body: unknown }): void => {
    expect(response.body).toEqual(expected);
  };
}

describe('Exception filters HTTP contract', () => {
  let app: INestApplication<App>;
  let logError: jest.SpyInstance;
  const message: unknown = expect.any(String);

  beforeAll(async () => {
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const module = await Test.createTestingModule({
      imports: [CoreModule],
      controllers: [CoreErrorsController],
    }).compile();

    app = module.createNestApplication();
    setupGlobalPipes(app);
    await app.init();
  });

  beforeEach(() => {
    logError.mockClear();
  });

  afterAll(async () => {
    await app.close();
    logError.mockRestore();
  });

  it('returns field errors for an invalid login model before authentication', async () => {
    await request(app.getHttpServer())
      .post('/core-errors/login')
      .send({ loginOrEmail: 'member', password: 123 })
      .expect(400)
      .expect(expectBody({ errorsMessages: [{ field: 'password', message }] }));
  });

  it('returns a separate error for each invalid input field', async () => {
    await request(app.getHttpServer())
      .post('/core-errors/login')
      .send({ loginOrEmail: 123, password: 123 })
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [
            { field: 'loginOrEmail', message },
            { field: 'password', message },
          ],
        }),
      );
  });

  it('returns 401 for validly shaped but incorrect credentials', async () => {
    await request(app.getHttpServer())
      .post('/core-errors/login')
      .send({ loginOrEmail: 'member', password: 'wrong-password' })
      .expect(401)
      .expect(
        expectBody({
          errorsMessages: [{ field: null, message: 'Unauthorized' }],
        }),
      );
  });

  it('preserves successful empty 204 responses', async () => {
    await request(app.getHttpServer())
      .post('/core-errors/comment')
      .send({ content: 'Valid content' })
      .expect(204)
      .expect('');
  });

  it('returns nested validation paths without losing the field name', async () => {
    await request(app.getHttpServer())
      .post('/core-errors/nested')
      .send({ comment: { content: '' } })
      .expect(400)
      .expect(
        expectBody({ errorsMessages: [{ field: 'comment.content', message }] }),
      );
  });

  it('preserves field details from business BadRequest exceptions', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/business-validation')
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [
            { field: 'recoveryCode', message: 'Recovery code is invalid' },
          ],
        }),
      );
  });

  it('maps a specific domain error code to its documented validation response', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/expired-code')
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [
            { field: 'code', message: 'Confirmation code is expired' },
          ],
        }),
      );
  });

  it('returns the general HTTP error message without a field name', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/bad-request')
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [{ field: null, message: 'The request is invalid' }],
        }),
      );
  });

  it('handles malformed JSON before route execution', async () => {
    await request(app.getHttpServer())
      .post('/core-errors/comment')
      .type('json')
      .send('{"content":')
      .expect(400)
      .expect(expectBody({ errorsMessages: [{ field: null, message }] }));
  });

  it('returns all domain field errors without exposing the internal code', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/multiple-field-errors')
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [
            { field: 'login', message: 'Login is invalid' },
            { field: 'email', message: 'Email is invalid' },
          ],
        }),
      );
  });

  it('preserves the status of a standard UnauthorizedException', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/unauthorized')
      .expect(401)
      .expect(
        expectBody({
          errorsMessages: [{ field: null, message: 'Unauthorized' }],
        }),
      );
  });

  it('returns a consistent 404 for a missing entity', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/missing')
      .expect(404)
      .expect(
        expectBody({
          errorsMessages: [{ field: null, message: 'Comment not found' }],
        }),
      );
  });

  it('preserves the framework 404 for an unregistered route', async () => {
    await request(app.getHttpServer())
      .get('/unregistered-route')
      .expect(404)
      .expect(expectBody({ errorsMessages: [{ field: null, message }] }));
  });

  it('preserves forbidden domain errors', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/forbidden')
      .expect(403)
      .expect(
        expectBody({
          errorsMessages: [{ field: null, message: 'Access denied' }],
        }),
      );
  });

  it('preserves throttling status and Retry-After after five attempts', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer())
        .get('/core-errors/limited')
        .expect(200);
    }

    await request(app.getHttpServer())
      .get('/core-errors/limited')
      .expect(429)
      .expect('Retry-After', /^\d+$/)
      .expect(expectBody({ errorsMessages: [{ field: null, message }] }));
  });

  it('uses the actual route parameter name for invalid ObjectIds', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/comments/invalid-id')
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [
            { field: 'commentId', message: 'Invalid ObjectId: invalid-id' },
          ],
        }),
      );
  });

  it('reports invalid ObjectIds from the global parsing pipe', async () => {
    await request(app.getHttpServer())
      .get('/core-errors/object-ids/invalid-id')
      .expect(400)
      .expect(
        expectBody({
          errorsMessages: [
            { field: 'id', message: 'Invalid ObjectId: invalid-id' },
          ],
        }),
      );
  });

  it('preserves successful ObjectId conversion', async () => {
    const id = new Types.ObjectId().toHexString();

    await request(app.getHttpServer())
      .get(`/core-errors/object-ids/${id}`)
      .expect(200)
      .expect(expectBody({ id }));
  });

  it.each([
    ['unexpected', 500, 'Database connection contains private details'],
    ['domain-server-error', 500, 'Private domain failure'],
    ['unavailable', 503, 'Private dependency details'],
    ['unmapped-code', 500, 'Private unmapped failure'],
  ])(
    'hides server details and logs the original error for %s',
    async (path, statusCode, originalMessage) => {
      await request(app.getHttpServer())
        .get(`/core-errors/${path}`)
        .expect(statusCode)
        .expect(
          expectBody({
            errorsMessages: [{ field: null, message: 'Internal server error' }],
          }),
        );

      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({ message: originalMessage }),
      );
      expect(logError).toHaveBeenCalledTimes(1);
    },
  );
});
