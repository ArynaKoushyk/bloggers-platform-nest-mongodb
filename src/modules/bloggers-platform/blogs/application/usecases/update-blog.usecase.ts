import { UpdateBlogDto } from '../dto/update-blog.dto';
import { UpdateBlogDomainDto } from '../../domain/dto/update-blog.domain.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IBlogsRepository } from '../interfaces/blogs.repository.interface';
import { BLOGS_REPOSITORY } from '../../../tokens/repository.tokens';

export class UpdateBlogCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateBlogDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute({ id, dto }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrFail(id);
    const domainDto: UpdateBlogDomainDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };
    blog.update(domainDto);
    await this.blogsRepository.save(blog);
  }
}
