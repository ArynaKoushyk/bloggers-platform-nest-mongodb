import type { INestApplication } from '@nestjs/common';
import { CommandBus, CqrsModule } from '@nestjs/cqrs';
import { APP_FILTER } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code.enum';
import { DomainException } from '../../../../core/exceptions/domain.exception';
import { AllExceptionsFilter } from '../../../../core/api/filters/all-exceptions.filter';
import { DomainExceptionFilter } from '../../../../core/api/filters/domain-exception.filter';
import type { Page } from '../../../../core/types/page.type';
import { setupGlobalPipes } from '../../../../setup/pipes.setup';
import { UserAccountsConfig } from '../../../user-accounts/config/user-accounts.config';
import { BLOGS_QUERY_REPOSITORY } from '../../tokens/repository.tokens';
import type { IBlogsQueryRepository } from '../application/interfaces/blogs.query-repository.interface';
import { GetBlogByIdQueryHandler } from '../application/queries/get-blog-by-id.query-handler';
import { GetBlogsQueryHandler } from '../application/queries/get-blogs.query-handler';
import type { BlogReadModel } from '../application/read-models/blog.read-model';
import type { BlogsQueryOptions } from '../application/types/blogs-query-options.type';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { BlogsController } from './blogs.controller';

// Configuration is injected explicitly; the HTTP contract does not need the ESM config loader.
jest.mock('@nestjs/config', () => ({ ConfigService: class ConfigService {} }));

describe('Blogs HTTP contract', () => {
  let app: INestApplication<App>;
  let executeCommand: jest.SpyInstance;
  const findAll = jest.fn<Promise<Page<BlogReadModel>>, [BlogsQueryOptions]>();
  const findByIdOrFail = jest.fn<Promise<BlogReadModel>, [string]>();
  const repository: IBlogsQueryRepository = { findAll, findByIdOrFail };

  const blog: BlogReadModel = {
    id: '507f1f77bcf86cd799439011',
    name: 'Nest blog',
    description: 'A blog about Nest',
    websiteUrl: 'https://example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    isMembership: false,
  };
  const expectedBlog = {
    ...blog,
    createdAt: blog.createdAt.toISOString(),
  };
  const input = {
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CqrsModule.forRoot()],
      controllers: [BlogsController],
      providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_FILTER, useClass: DomainExceptionFilter },
        GetBlogsQueryHandler,
        GetBlogByIdQueryHandler,
        { provide: BLOGS_QUERY_REPOSITORY, useValue: repository },
        {
          provide: UserAccountsConfig,
          useValue: { adminLogin: 'admin', adminPassword: 'test-password' },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    setupGlobalPipes(app);
    await app.init();
    executeCommand = jest.spyOn(app.get(CommandBus), 'execute');
  });

  beforeEach(() => {
    jest.resetAllMocks();
    // Extra internal fields must not become part of the HTTP response.
    const projection = { ...blog, internalNote: 'private' };
    findByIdOrFail.mockResolvedValue(projection);
    findAll.mockResolvedValue({
      items: [projection],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('preserves default pagination and maps internal data to the public response', async () => {
    await request(app.getHttpServer())
      .get('/blogs')
      .expect(200)
      .expect({
        items: [expectedBlog],
        totalCount: 1,
        pagesCount: 1,
        page: 1,
        pageSize: 10,
      });

    expect(findAll).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      searchNameTerm: null,
    });
  });

  it('transforms custom query parameters and preserves pagination metadata', async () => {
    findAll.mockResolvedValueOnce({
      items: [blog],
      totalCount: 7,
      page: 2,
      pageSize: 2,
    });

    await request(app.getHttpServer())
      .get('/blogs')
      .query({
        pageNumber: 2,
        pageSize: 2,
        sortBy: 'name',
        sortDirection: 'asc',
        searchNameTerm: 'Nest',
      })
      .expect(200)
      .expect({
        items: [expectedBlog],
        totalCount: 7,
        pagesCount: 4,
        page: 2,
        pageSize: 2,
      });

    expect(findAll).toHaveBeenCalledWith({
      pageNumber: 2,
      pageSize: 2,
      sortBy: 'name',
      sortDirection: 'asc',
      searchNameTerm: 'Nest',
    });
  });

  it('preserves the public response for a single blog', async () => {
    await request(app.getHttpServer())
      .get(`/blogs/${blog.id}`)
      .expect(200)
      .expect(expectedBlog);
    expect(findByIdOrFail).toHaveBeenCalledWith(blog.id);
  });

  it('creates a blog using validated data and returns its public representation', async () => {
    executeCommand.mockResolvedValueOnce(blog.id);

    await request(app.getHttpServer())
      .post('/blogs')
      .auth('admin', 'test-password')
      .send({ ...input, name: ` ${input.name} `, internalNote: 'ignored' })
      .expect(201)
      .expect(expectedBlog);

    expect(executeCommand).toHaveBeenCalledWith(new CreateBlogCommand(input));
  });

  it('updates a blog and returns an empty 204 response', async () => {
    executeCommand.mockResolvedValueOnce(undefined);

    await request(app.getHttpServer())
      .put(`/blogs/${blog.id}`)
      .auth('admin', 'test-password')
      .send(input)
      .expect(204)
      .expect('');

    expect(executeCommand).toHaveBeenCalledWith(
      new UpdateBlogCommand(blog.id, input),
    );
  });

  it('deletes a blog and returns an empty 204 response', async () => {
    executeCommand.mockResolvedValueOnce(undefined);

    await request(app.getHttpServer())
      .delete(`/blogs/${blog.id}`)
      .auth('admin', 'test-password')
      .expect(204)
      .expect('');

    expect(executeCommand).toHaveBeenCalledWith(new DeleteBlogCommand(blog.id));
  });

  it('rejects invalid query parameters before accessing the repository', async () => {
    await request(app.getHttpServer())
      .get('/blogs')
      .query({ pageNumber: 0, sortBy: 'passwordHash' })
      .expect(400);
    expect(findAll).not.toHaveBeenCalled();
  });

  it('rejects an invalid blog id before accessing the repository', async () => {
    await request(app.getHttpServer())
      .get('/blogs/invalid-id')
      .expect(400)
      .expect({
        errorsMessages: [
          { field: 'id', message: 'Invalid ObjectId: invalid-id' },
        ],
      });
    expect(findByIdOrFail).not.toHaveBeenCalled();
  });

  it('preserves the 404 response for a missing blog', async () => {
    findByIdOrFail.mockRejectedValueOnce(
      new DomainException({
        code: DomainExceptionCode.NotFound,
        errorsMessages: [{ field: null, message: 'Blog not found' }],
      }),
    );

    await request(app.getHttpServer())
      .get(`/blogs/${blog.id}`)
      .expect(404)
      .expect({
        errorsMessages: [{ field: null, message: 'Blog not found' }],
      });
  });

  it('requires administrator authentication for creating a blog', async () => {
    await request(app.getHttpServer())
      .post('/blogs')
      .send(input)
      .expect(401)
      .expect({
        errorsMessages: [{ field: null, message: 'Unauthorized ' }],
      });
    expect(executeCommand).not.toHaveBeenCalled();
  });
});
