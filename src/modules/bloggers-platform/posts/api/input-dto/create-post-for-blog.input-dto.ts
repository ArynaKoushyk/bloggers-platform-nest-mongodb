import { IsStringWithTrim } from '../../../../../core/api/decorators/validation/is-string-with-trim.decorator';
import {
  postContentConstraints,
  postShortDescriptionConstraints,
  postTitleConstraints,
} from './constants/post-validation.constants';

export class CreatePostForBlogInputDto {
  @IsStringWithTrim(
    postTitleConstraints.minLength,
    postTitleConstraints.maxLength,
  )
  title: string;

  @IsStringWithTrim(
    postShortDescriptionConstraints.minLength,
    postShortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @IsStringWithTrim(
    postContentConstraints.minLength,
    postContentConstraints.maxLength,
  )
  content: string;
}
