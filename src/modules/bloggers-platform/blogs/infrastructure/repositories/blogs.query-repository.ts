import { Injectable } from '@nestjs/common';
import { Blog } from '../../domain/blog.entity';
import type { BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import type { BlogsQueryOptions } from '../../application/types/blogs-query-options.type';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import { calculateSkip } from '../../../../../core/pagination/calculate-skip.util';
import type { Page } from '../../../../../core/types/page.type';
import type { BlogReadModel } from '../../application/read-models/blog.read-model';
import type { IBlogsQueryRepository } from '../../application/interfaces/blogs.query-repository.interface';

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
  ) {}
  async findAll(options: BlogsQueryOptions): Promise<Page<BlogReadModel>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = options;
    const skip = calculateSkip(pageNumber, pageSize);
    const limit = pageSize;
    const filter: FilterQuery<Blog> = {
      deletedAt: null,
    };

    if (options.searchNameTerm) {
      filter.name = {
        $regex: options.searchNameTerm,
        $options: 'i',
      };
    }

    const blogs = await this.blogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalCount = await this.blogModel.countDocuments(filter);

    const blogReadModels = blogs.map((blog) => this.toReadModel(blog));

    return {
      items: blogReadModels,
      page: pageNumber,
      pageSize,
      totalCount,
    };
  }

  async findByIdOrFail(id: string): Promise<BlogReadModel> {
    const blog = await this.blogModel
      .findOne({
        _id: id,
        deletedAt: null,
      })
      .lean()
      .exec();

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        errorsMessages: [{ field: null, message: 'Blog not found ' }],
      });
    }

    return this.toReadModel(blog);
  }

  private toReadModel(
    blog: Pick<
      BlogDocument,
      | '_id'
      | 'name'
      | 'description'
      | 'websiteUrl'
      | 'createdAt'
      | 'isMembership'
    >,
  ): BlogReadModel {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
