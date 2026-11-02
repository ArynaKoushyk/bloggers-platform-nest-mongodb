import { IsEnum } from 'class-validator';
import { BaseQueryParamsInputDto } from '../../../../../core/api/dto/base-query-params.input-dto';
import { CommentSortField } from './enums/comment-sort-field.enum';
import { CommentsQueryParams } from '../../application/interfaces/comments.query-repository.interface';

export class GetCommentsQueryParams
  extends BaseQueryParamsInputDto
  implements CommentsQueryParams
{
  @IsEnum(CommentSortField)
  sortBy = CommentSortField.CreatedAt;
}
