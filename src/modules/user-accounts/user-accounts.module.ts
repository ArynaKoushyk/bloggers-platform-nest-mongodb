import { Module } from '@nestjs/common';
import { UsersController } from './users/api/users.controller';
import { UsersQueryRepository } from './users/infrastructure/repositories/users.query-repository';
import { UsersRepository } from './users/infrastructure/repositories/users.repository';
import { PasswordHashAdapter } from './users/infrastructure/adapters/password-hash.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { LocalStrategy } from './auth/infrastructure/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/infrastructure/strategies/jwt.strategy';
import { AuthQueryRepository } from './auth/infrastructure/repositories/auth.query-repository';
import { JwtAdapter } from './auth/infrastructure/adapters/jwt.adapter';
import { AuthController } from './auth/api/auth.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { CreateUserUseCase } from './users/application/usecases/create-user.usecase';
import { DeleteUserUseCase } from './users/application/usecases/delete-user.usecase';
import { GetUserByIdQueryHandler } from './users/application/queries/get-user-by-id.query-handler';
import { GetUsersQueryHandler } from './users/application/queries/get-users.query-handler';
import { UsersFactory } from './users/application/factories/users.factory';
import { GetCurrentUserQueryHandler } from './auth/application/queries/get-current-user.query-handler';
import { AuthService } from './auth/application/auth.service';
import { RegisterUserUseCase } from './auth/application/usecases/register-user.usecase';
import { LoginUserUseCase } from './auth/application/usecases/login-user.usecase';
import { ConfirmRegistrationUseCase } from './auth/application/usecases/confirm-registration.usecase';
import { ResendConfirmationEmailUseCase } from './auth/application/usecases/resend-confirmation-email.usecase';
import { RequestPasswordRecoveryUseCase } from './auth/application/usecases/request-password-recovery.usecase';
import { ResetPasswordUseCase } from './auth/application/usecases/reset-password.usecase';
import {
  AUTH_QUERY_REPOSITORY,
  AUTH_SESSIONS_REPOSITORY,
  SECURITY_DEVICES_QUERY_REPOSITORY,
  USERS_QUERY_REPOSITORY,
  USERS_REPOSITORY,
} from './tokens/repository.tokens';
import { AuthSessionsRepository } from './security-devices/infrastructure/repositories/auth-sessions.repository';
import { SecurityDevicesQueryRepository } from './security-devices/infrastructure/repositories/security-devices.query-repository';
import { AuthSessionAccessPolicy } from './security-devices/application/policies/auth-session-access.policy';
import {
  AuthSession,
  AuthSessionSchema,
} from './security-devices/domain/auth-session.entity';

const useCases = [
  CreateUserUseCase,
  DeleteUserUseCase,
  RegisterUserUseCase,
  LoginUserUseCase,
  ConfirmRegistrationUseCase,
  ResendConfirmationEmailUseCase,
  RequestPasswordRecoveryUseCase,
  ResetPasswordUseCase,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
  GetUsersQueryHandler,
  GetCurrentUserQueryHandler,
];

const repositoryProviders = [
  {
    provide: USERS_REPOSITORY,
    useClass: UsersRepository,
  },
  {
    provide: USERS_QUERY_REPOSITORY,
    useClass: UsersQueryRepository,
  },
  {
    provide: AUTH_QUERY_REPOSITORY,
    useClass: AuthQueryRepository,
  },

  {
    provide: AUTH_SESSIONS_REPOSITORY,
    useClass: AuthSessionsRepository,
  },
  {
    provide: SECURITY_DEVICES_QUERY_REPOSITORY,
    useClass: SecurityDevicesQueryRepository,
  },
];

const factories = [UsersFactory];
const policies = [AuthSessionAccessPolicy];

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: AuthSession.name,
        schema: AuthSessionSchema,
      },
    ]),
    PassportModule,
    JwtModule.register({}),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    ...useCases,
    ...queryHandlers,
    ...repositoryProviders,
    ...factories,
    ...policies,
    AuthService,
    PasswordHashAdapter,
    LocalStrategy,
    JwtStrategy,
    JwtAdapter,
  ],
  exports: [JwtStrategy],
})
export class UserAccountsModule {}
