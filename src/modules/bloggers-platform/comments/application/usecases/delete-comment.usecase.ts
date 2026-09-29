import { CommentAccessPolicy } from '../policies/comment-access.policy';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { ICommentsRepository } from '../interfaces/comments.repository.interface';
import { COMMENTS_REPOSITORY } from '../../../tokens/repository.tokens';

export class DeleteCommentCommand extends Command<void> {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: ICommentsRepository,
    private readonly commentAccessPolicy: CommentAccessPolicy,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findByIdOrFail(commentId);
    this.commentAccessPolicy.assertCanModify(comment, userId);
    comment.markAsDeleted();
    await this.commentsRepository.save(comment);
  }
}
