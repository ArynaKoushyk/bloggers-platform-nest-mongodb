import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UserReadModel } from '../read-models/user.read-model';

export class UserViewMapper {
  static toView(user: UserReadModel): UserViewDto {
    const dto = new UserViewDto();

    dto.id = user.id;
    dto.login = user.login;
    dto.email = user.email;
    dto.createdAt = user.createdAt;

    return dto;
  }
}
