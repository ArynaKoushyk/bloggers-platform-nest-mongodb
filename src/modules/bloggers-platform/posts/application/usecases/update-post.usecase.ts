import { UpdatePostDto } from '../dto/update-post.dto';
import { UpdatePostDomainDto } from '../../domain/dto/update-post.domain.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IPostsRepository } from '../interfaces/posts.repository.interface';
import type { IBlogsRepository } from '../../../blogs/application/interfaces/blogs.repository.interface';
import {
  BLOGS_REPOSITORY,
  POSTS_REPOSITORY,
} from '../../../tokens/repository.tokens';

export class UpdatePostCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdatePostDto,
  ) {
    super();
  }
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute({ id, dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrFail(id);

    const { title, shortDescription, content, blogId } = dto;

    const blog = await this.blogsRepository.findByIdOrFail(blogId);

    const domainDto: UpdatePostDomainDto = {
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
    };

    post.update(domainDto);

    await this.postsRepository.save(post);
  }
}
