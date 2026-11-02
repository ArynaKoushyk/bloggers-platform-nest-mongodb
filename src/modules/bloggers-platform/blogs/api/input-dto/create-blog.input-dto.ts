import { Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/api/decorators/validation/is-string-with-trim.decorator';
import {
  blogDescriptionConstraints,
  blogNameConstraints,
  blogWebsiteUrlConstraints,
} from './constants/blog-validation.constants';

export class CreateBlogInputDto {
  @IsStringWithTrim(
    blogNameConstraints.minLength,
    blogNameConstraints.maxLength,
  )
  name: string;

  @IsStringWithTrim(
    blogDescriptionConstraints.minLength,
    blogDescriptionConstraints.maxLength,
  )
  description: string;

  @IsStringWithTrim(
    blogWebsiteUrlConstraints.minLength,
    blogWebsiteUrlConstraints.maxLength,
  )
  @Matches(blogWebsiteUrlConstraints.match)
  websiteUrl: string;
}
