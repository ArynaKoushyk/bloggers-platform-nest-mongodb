import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IPostsRepository } from '../interfaces/posts.repository.interface';
import { POSTS_REPOSITORY } from '../../../tokens/repository.tokens';

export class DeletePostCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
  ) {}

  async execute({ id }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrFail(id);
    post.markAsDeleted();
    await this.postsRepository.save(post);
  }
}
