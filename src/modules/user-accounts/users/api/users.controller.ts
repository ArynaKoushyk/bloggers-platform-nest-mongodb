import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasePaginatedViewDto } from '../../../../core/api/dto/base-paginated.view-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { BasicAuthGuard } from '../../auth/guards/basic/basic-auth.guard';
import { ObjectIdValidationPipe } from '../../../../core/api/pipes/object-id-validation.pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { GetUsersQuery } from '../application/queries/get-users.query-handler';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query-handler';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<BasePaginatedViewDto<UserViewDto>> {
    return await this.queryBus.execute(new GetUsersQuery(query));
  }

  @Post()
  async createUser(@Body() dto: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.commandBus.execute(new CreateUserCommand(dto));
    return await this.queryBus.execute(new GetUserByIdQuery(userId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    return await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
