import { Post, type PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain.dto';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import type { IPostsRepository } from '../interfaces/posts.repository.interface';
import type { IBlogsRepository } from '../../../blogs/application/interfaces/blogs.repository.interface';
import {
  BLOGS_REPOSITORY,
  POSTS_REPOSITORY,
} from '../../../tokens/repository.tokens';

export class CreatePostCommand extends Command<string> {
  constructor(public readonly dto: CreatePostDto) {
    super();
  }
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: PostModelType,
    @Inject(POSTS_REPOSITORY)
    private readonly postsRepository: IPostsRepository,
    @Inject(BLOGS_REPOSITORY)
    private readonly blogsRepository: IBlogsRepository,
  ) {}

  async execute({ dto }: CreatePostCommand): Promise<string> {
    const { title, shortDescription, content, blogId } = dto;

    const blog = await this.blogsRepository.findByIdOrFail(blogId);

    const domainDto: CreatePostDomainDto = {
      title,
      shortDescription,
      content,
      blogId,
      blogName: blog.name,
    };

    const createdPost = this.postModel.createInstance(domainDto);

    await this.postsRepository.save(createdPost);

    return createdPost._id.toString();
  }
}
