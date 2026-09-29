import { CurrentUserViewDto } from '../../api/view-dto/current-user.view-dto';
import { CurrentUserReadModel } from '../read-models/current-user.read-model';

export class CurrentUserViewMapper {
  static toView(user: CurrentUserReadModel): CurrentUserViewDto {
    const dto = new CurrentUserViewDto();

    dto.userId = user.userId;
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
