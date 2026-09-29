import { IsEnum } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base-query-params.input-dto';
import { CommentSortField } from './enums/comment-sort-field.enum';
import { CommentsQueryParams } from '../../application/interfaces/comments.query-repository.interface';

export class GetCommentsQueryParams
  extends BaseQueryParams
  implements CommentsQueryParams
{
  @IsEnum(CommentSortField)
  sortBy = CommentSortField.CreatedAt;
}
