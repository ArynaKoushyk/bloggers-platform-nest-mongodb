import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BaseQueryParamsInputDto } from '../../../../../core/api/dto/base-query-params.input-dto';
import { BlogSortField } from '../../application/enums/blog-sort-field.enum';

export class GetBlogsQueryParamsInputDto extends BaseQueryParamsInputDto {
  @IsEnum(BlogSortField)
  sortBy = BlogSortField.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
