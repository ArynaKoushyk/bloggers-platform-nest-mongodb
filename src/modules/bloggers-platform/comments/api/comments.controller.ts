import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentViewDto } from './view-dto/comment.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation.pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';
import { JwtAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-auth.guard';
import { UpdateLikeStatusInputDto } from '../../likes/api/input-dto/update-like-status.input-dto';
import { CurrentUser } from '../../../user-accounts/auth/decorators/param/current-user.decorator';
import { UserContextDto } from '../../../user-accounts/auth/application/dto/user-context.dto';
import { UpdateLikeStatusCommand } from '../../likes/application/usecases/update-like-status.usecase';
import { LikeTargetType } from '../../likes/domain/enums/like-target-type.enum';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/guards/jwt/jwt-optional-auth.guard';
import { OptionalCurrentUser } from '../../../user-accounts/auth/decorators/param/optional-current-user.decorator';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getCommentById(
    @Param('id', ObjectIdValidationPipe) id: string,
    @OptionalCurrentUser('id') userId: string | null,
  ): Promise<CommentViewDto> {
    return await this.queryBus.execute(new GetCommentByIdQuery(id, userId));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  async updateComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @Body() dto: UpdateCommentInputDto,
    @CurrentUser()
    user: UserContextDto,
  ): Promise<void> {
    return await this.commandBus.execute(
      new UpdateCommentCommand(commentId, user.id, dto),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @CurrentUser()
    user: UserContextDto,
  ): Promise<void> {
    return await this.commandBus.execute(
      new DeleteCommentCommand(commentId, user.id),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId/like-status')
  async updateLikeStatus(
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
    @Body() dto: UpdateLikeStatusInputDto,
    @CurrentUser()
    user: UserContextDto,
  ): Promise<void> {
    return await this.commandBus.execute(
      new UpdateLikeStatusCommand(
        commentId,
        LikeTargetType.Comment,
        dto.likeStatus,
        user,
      ),
    );
  }
}
