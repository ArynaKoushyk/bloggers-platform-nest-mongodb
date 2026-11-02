import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParamsInputDto } from '../../../../../core/api/dto/base-query-params.input-dto';
import { PostSortField } from './enums/post-sort-field.enum';
import { PostsQueryParams } from '../../application/interfaces/posts.query-repository.interface';

export class GetPostsQueryParams
  extends BaseQueryParamsInputDto
  implements PostsQueryParams
{
  @IsEnum(PostSortField)
  sortBy = PostSortField.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
