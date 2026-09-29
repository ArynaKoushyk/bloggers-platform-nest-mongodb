import { Injectable } from '@nestjs/common';
import { Blog } from '../../domain/blog.entity';
import type { BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../../core/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code.enum';
import {
  BlogReadModel,
  BlogsPageReadModel,
} from '../../application/read-models/blog.read-model';
import type { IBlogsQueryRepository } from '../../application/interfaces/blogs.query-repository.interface';

@Injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
  ) {}
  async findAll(query: GetBlogsQueryParams): Promise<BlogsPageReadModel> {
    const { pageNumber, pageSize, sortBy, sortDirection } = query;
    const skip = query.calculateSkip();
    const limit = pageSize;
    const filter: FilterQuery<Blog> = {
      deletedAt: null,
    };

    if (query.searchNameTerm) {
      filter.name = {
        $regex: query.searchNameTerm,
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

    const blogReadModels: BlogReadModel[] = blogs.map((blog) => ({
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    }));

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
        message: 'Blog not found ',
      });
    }

    const blogReadModel: BlogReadModel = {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };

    return blogReadModel;
  }
}
