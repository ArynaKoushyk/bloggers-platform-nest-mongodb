import { ApiParam } from '@nestjs/swagger';
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
import { PostViewDto } from './view-dto/post.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base-paginated.view-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { BasicAuthGuard } from '../../../user-accounts/auth/guards/basic/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation.pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query-handler';
import { GetPostsQuery } from '../application/queries/get-posts.query-handler';
import { UpdateLikeStatusCommand } from '../../likes/application/usecases/update-like-status.usecase';
import { LikeTargetType } from '../../likes/domain/enums/like-target-type.enum';
import { UpdateLikeStatusInputDto } from '../../likes/api/input-dto/update-like-status.input-dto';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-auth.guard';
import { CurrentUser } from '../../../user-accounts/auth/decorators/param/current-user.decorator';
import { UserContextDto } from '../../../user-accounts/auth/application/dto/user-context.dto';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-optional-auth.guard';
import { OptionalCurrentUser } from '../../../user-accounts/auth/decorators/param/optional-current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('PostsController created');
  }

  @ApiParam({ name: 'id' })
  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getPostById(
    @Param('id', ObjectIdValidationPipe) id: string,
    @OptionalCurrentUser('id') userId: string | null,
  ): Promise<PostViewDto> {
    return await this.queryBus.execute(new GetPostByIdQuery(id, userId));
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getPosts(
    @Query() queryParams: GetPostsQueryParams,
    @OptionalCurrentUser('id') userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return await this.queryBus.execute(new GetPostsQuery(queryParams, userId));
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(
    @Body() dto: CreatePostInputDto,
    @OptionalCurrentUser('id') userId: string | null,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand(dto));

    return await this.queryBus.execute(new GetPostByIdQuery(postId, userId));
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() dto: UpdatePostInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, dto));
  }

  @ApiParam({ name: 'id' })
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return await this.commandBus.execute(new DeletePostCommand(id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':postId/like-status')
  async updateLikeStatus(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Body() dto: UpdateLikeStatusInputDto,
    @CurrentUser()
    user: UserContextDto,
  ): Promise<void> {
    return await this.commandBus.execute(
      new UpdateLikeStatusCommand(
        postId,
        LikeTargetType.Post,
        dto.likeStatus,
        user,
      ),
    );
  }
}
