import { InjectModel } from '@nestjs/mongoose';
import { Inject } from '@nestjs/common';
import { Comment, type CommentModelType } from '../../domain/comment.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UserContextDto } from '../../../../user-accounts/auth/application/dto/user-context.dto';
import { CreateCommentDomainDto } from '../../domain/dto/create-comment.domain.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { ICommentsRepository } from '../interfaces/comments.repository.interface';
import type { IPostsRepository } from '../../../posts/application/interfaces/posts.repository.interface';
import {
  COMMENTS_REPOSITORY,
  POSTS_REPOSITORY,
} from '../../../tokens/repository.tokens';

export class CreateCommentCommand extends Command<string> {
  constructor(
    public readonly postId: string,
    public readonly dto: CreateCommentDto,
    public readonly user: UserContextDto,
  ) {
    super();
  }
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: ICommentsRepository,
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({ postId, dto, user }: CreateCommentCommand): Promise<string> {
    const { content } = dto;

    await this.postsRepository.findByIdOrFail(postId);
    const createData: CreateCommentDomainDto = {
      postId,
      content,
      commentatorInfo: {
        userId: user.id,
        userLogin: user.login,
      },
    };
    const createdComment = this.commentModel.createInstance(createData);
    await this.commentsRepository.save(createdComment);

    return createdComment._id.toString();
  }
}
