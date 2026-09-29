import { CommentAccessPolicy } from '../policies/comment-access.policy';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { UpdateCommentDomainDto } from '../../domain/dto/update-comment.domain.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { ICommentsRepository } from '../interfaces/comments.repository.interface';
import { COMMENTS_REPOSITORY } from '../../../tokens/repository.tokens';

export class UpdateCommentCommand extends Command<void> {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly dto: UpdateCommentDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: ICommentsRepository,
    private readonly commentAccessPolicy: CommentAccessPolicy,
  ) {}

  async execute({
    commentId,
    userId,
    dto,
  }: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);
    this.commentAccessPolicy.assertCanModify(comment, userId);
    const domainDto: UpdateCommentDomainDto = {
      content: dto.content,
    };
    comment.update(domainDto);
    await this.commentsRepository.save(comment);
  }
}
