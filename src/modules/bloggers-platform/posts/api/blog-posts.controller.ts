import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostForBlogInputDto } from './input-dto/create-post-for-blog.input-dto';
import { PostViewDto } from './view-dto/post.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import type { CreatePostDto } from '../application/dto/create-post.dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/guards/basic/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation.pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogPostsQuery } from '../application/queries/get-blog-posts.query-handler';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query-handler';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-optional-auth.guard';
import { OptionalCurrentUser } from '../../../user-accounts/auth/decorators/param/optional-current-user.decorator';

@Controller('blogs/:blogId/posts')
export class BlogPostsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getBlogPosts(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Query() queryParams: GetPostsQueryParams,
    @OptionalCurrentUser('id') userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.queryBus.execute(
      new GetBlogPostsQuery(blogId, queryParams, userId),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlogPost(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Body() dto: CreatePostForBlogInputDto,
    @OptionalCurrentUser('id') userId: string | null,
  ): Promise<PostViewDto> {
    const data: CreatePostDto = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId,
    };

    const postId = await this.commandBus.execute(new CreatePostCommand(data));
    return await this.queryBus.execute(new GetPostByIdQuery(postId, userId));
  }
}
