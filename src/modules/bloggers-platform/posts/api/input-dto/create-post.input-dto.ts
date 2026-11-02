import { IsMongoId } from 'class-validator';
import { CreatePostDto } from '../../application/dto/create-post.dto';
import { IsStringWithTrim } from '../../../../../core/api/decorators/validation/is-string-with-trim.decorator';
import {
  postContentConstraints,
  postShortDescriptionConstraints,
  postTitleConstraints,
} from './constants/post-validation.constants';

export class CreatePostInputDto implements CreatePostDto {
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

  @IsMongoId()
  blogId: string;
}
