import { Module, type Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsRepository } from './blogs/infrastructure/repositories/blogs.repository';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infrastructure/repositories/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsRepository } from './posts/infrastructure/repositories/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/repositories/posts.query-repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { BlogPostsController } from './posts/api/blog-posts.controller';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsRepository } from './comments/infrastructure/repositories/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/repositories/comments.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { PostCommentsController } from './comments/api/post-comments.controller';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CommentAccessPolicy } from './comments/application/policies/comment-access.policy';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { GetBlogsQueryHandler } from './blogs/application/queries/get-blogs.query-handler';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query-handler';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query-handler';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query-handler';
import { GetBlogPostsQueryHandler } from './posts/application/queries/get-blog-posts.query-handler';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query-handler';
import { GetPostCommentsQueryHandler } from './comments/application/queries/get-post-comments.query-handler';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { LikesRepository } from './likes/infrastructure/repositories/likes.repository';
import { LikesQueryRepository } from './likes/infrastructure/repositories/likes.query-repository';
import {
  BLOGS_QUERY_REPOSITORY,
  BLOGS_REPOSITORY,
  COMMENTS_QUERY_REPOSITORY,
  COMMENTS_REPOSITORY,
  LIKES_QUERY_REPOSITORY,
  LIKES_REPOSITORY,
  POSTS_QUERY_REPOSITORY,
  POSTS_REPOSITORY,
} from './tokens/repository.tokens';

const useCases = [
  // Blogs
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,

  // Posts
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,

  // Comments
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
];

const queryHandlers = [
  // Blogs
  GetBlogsQueryHandler,
  GetBlogByIdQueryHandler,

  // Posts
  GetPostsQueryHandler,
  GetPostByIdQueryHandler,
  GetBlogPostsQueryHandler,

  // Comments
  GetCommentByIdQueryHandler,
  GetPostCommentsQueryHandler,
];
const repositoryProviders = [
  // Blogs
  {
    provide: BLOGS_REPOSITORY,
    useClass: BlogsRepository,
  },
  {
    provide: BLOGS_QUERY_REPOSITORY,
    useClass: BlogsQueryRepository,
  },

  // Posts
  {
    provide: POSTS_REPOSITORY,
    useClass: PostsRepository,
  },
  {
    provide: POSTS_QUERY_REPOSITORY,
    useClass: PostsQueryRepository,
  },

  // Comments
  {
    provide: COMMENTS_REPOSITORY,
    useClass: CommentsRepository,
  },
  {
    provide: COMMENTS_QUERY_REPOSITORY,
    useClass: CommentsQueryRepository,
  },

  // Likes
  {
    provide: LIKES_REPOSITORY,
    useClass: LikesRepository,
  },
  {
    provide: LIKES_QUERY_REPOSITORY,
    useClass: LikesQueryRepository,
  },
];

const policies = [CommentAccessPolicy];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),

    UserAccountsModule,
  ],
  controllers: [
    BlogsController,
    PostsController,
    BlogPostsController,
    CommentsController,
    PostCommentsController,
  ],
  providers: [
    ...useCases,
    ...queryHandlers,
    ...repositoryProviders,
    ...policies,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
