import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, required: true })
  content: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const { title, shortDescription, content, blogId, blogName } = dto;
    const post = new this();

    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;
    post.blogName = blogName;

    return post as PostDocument;
  }

  update(dto: UpdatePostDomainDto): void {
    const { title, shortDescription, content, blogId, blogName } = dto;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogName = blogName;
    this.blogId = blogId;
  }

  markAsDeleted() {
    this.deletedAt = new Date();
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<Post> & typeof Post;
