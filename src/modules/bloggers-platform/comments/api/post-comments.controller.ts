import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasePaginatedViewDto } from '../../../../core/api/dto/base-paginated.view-dto';
import { GetCommentsQueryParams } from './input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/api/pipes/object-id-validation.pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPostCommentsQuery } from '../application/queries/get-post-comments.query-handler';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-optional-auth.guard';
import { OptionalCurrentUser } from '../../../user-accounts/auth/decorators/param/optional-current-user.decorator';
import { CreateCommentInputDto } from './input-dto/create-comment.input-dto';
import { CreateCommentCommand } from '../application/usecases/create-comment.usecase';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-auth.guard';
import { CurrentUser } from '../../../user-accounts/auth/decorators/param/current-user.decorator';
import type { AuthenticatedUser } from '../../../user-accounts/auth/application/types/authenticated-user.type';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';

@Controller('posts/:postId/comments')
export class PostCommentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get()
  async getPostComments(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Query() queryParams: GetCommentsQueryParams,
    @OptionalCurrentUser('userId') userId: string | null,
  ): Promise<BasePaginatedViewDto<CommentViewDto>> {
    return await this.queryBus.execute(
      new GetPostCommentsQuery(postId, queryParams, userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCommentForPost(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Body() dto: CreateCommentInputDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const commentId = await this.commandBus.execute(
      new CreateCommentCommand(postId, dto, user),
    );
    return await this.queryBus.execute(
      new GetCommentByIdQuery(commentId, user.userId),
    );
  }
}
