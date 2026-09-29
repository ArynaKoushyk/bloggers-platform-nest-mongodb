import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { PostSortField } from './enums/post-sort-field.enum';
import { PostsQueryParams } from '../../application/interfaces/posts.query-repository.interface';

export class GetPostsQueryParams
  extends BaseQueryParams
  implements PostsQueryParams
{
  @IsEnum(PostSortField)
  sortBy = PostSortField.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
