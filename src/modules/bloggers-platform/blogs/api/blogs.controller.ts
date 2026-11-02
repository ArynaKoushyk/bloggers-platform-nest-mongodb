import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { BlogViewDto } from './view-dto/blog.view-dto';
import { GetBlogsQueryParamsInputDto } from './input-dto/get-blogs-query-params.input-dto';
import { BasePaginatedViewDto } from '../../../../core/api/dto/base-paginated.view-dto';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/guards/basic/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../../core/api/pipes/object-id-validation.pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import type { CreateBlogDto } from '../application/dto/create-blog.dto';
import type { UpdateBlogDto } from '../application/dto/update-blog.dto';
import type { BlogsQueryOptions } from '../application/types/blogs-query-options.type';
import { BlogViewMapper } from './mappers/blog-view.mapper';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('BlogsController created');
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getBlogById(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<BlogViewDto> {
    const blog = await this.queryBus.execute(new GetBlogByIdQuery(id));

    return BlogViewMapper.toView(blog);
  }

  @Get()
  async getBlogs(
    @Query() queryParams: GetBlogsQueryParamsInputDto,
  ): Promise<BasePaginatedViewDto<BlogViewDto>> {
    const options: BlogsQueryOptions = {
      pageNumber: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      sortBy: queryParams.sortBy,
      sortDirection: queryParams.sortDirection,
      searchNameTerm: queryParams.searchNameTerm,
    };

    const blogsPage = await this.queryBus.execute(new GetBlogsQuery(options));

    return BlogViewMapper.toPageView(blogsPage);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto): Promise<BlogViewDto> {
    const data: CreateBlogDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    const blogId = await this.commandBus.execute(new CreateBlogCommand(data));
    const blog = await this.queryBus.execute(new GetBlogByIdQuery(blogId));

    return BlogViewMapper.toView(blog);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() dto: UpdateBlogInputDto,
  ): Promise<void> {
    const data: UpdateBlogDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    await this.commandBus.execute(new UpdateBlogCommand(id, data));
  }

  @ApiParam({ name: 'id' })
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return await this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
