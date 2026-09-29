import { CreateBlogDto } from '../dto/create-blog.dto';
import { CreateBlogDomainDto } from '../../domain/dto/create-blog.domain.dto';
import { Blog, type BlogModelType } from '../../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IBlogsRepository } from '../interfaces/blogs.repository.interface';
import { BLOGS_REPOSITORY } from '../../../tokens/repository.tokens';

export class CreateBlogCommand extends Command<string> {
  constructor(public readonly dto: CreateBlogDto) {
    super();
  }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: BlogModelType,
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<string> {
    const domainDto: CreateBlogDomainDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
    };

    const createdBlog = this.blogModel.createInstance(domainDto);

    await this.blogsRepository.save(createdBlog);
    return createdBlog._id.toString();
  }
}
