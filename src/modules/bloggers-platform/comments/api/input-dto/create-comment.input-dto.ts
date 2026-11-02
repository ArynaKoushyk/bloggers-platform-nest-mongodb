import { IsStringWithTrim } from '../../../../../core/api/decorators/validation/is-string-with-trim.decorator';
import { CreateCommentDto } from '../../application/dto/create-comment.dto';
import { commentContentConstraints } from './constants/comment-validation.constants';

export class CreateCommentInputDto implements CreateCommentDto {
  @IsStringWithTrim(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  content: string;
}
