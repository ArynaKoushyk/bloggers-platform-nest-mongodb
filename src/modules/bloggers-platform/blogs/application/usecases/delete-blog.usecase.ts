import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IBlogsRepository } from '../interfaces/blogs.repository.interface';
import { BLOGS_REPOSITORY } from '../../../tokens/repository.tokens';

export class DeleteBlogCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrFail(command.id);
    blog.markAsDeleted();
    await this.blogsRepository.save(blog);
  }
}
