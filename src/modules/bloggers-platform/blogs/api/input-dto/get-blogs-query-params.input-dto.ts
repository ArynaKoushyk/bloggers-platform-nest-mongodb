import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { BlogSortField } from './enums/blog-sort-field.enum';
import { BlogsQueryParams } from '../../application/interfaces/blogs.query-repository.interface';

export class GetBlogsQueryParams
  extends BaseQueryParams
  implements BlogsQueryParams
{
  @IsEnum(BlogSortField)
  sortBy = BlogSortField.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
