import { configModule } from './config-dynamic-module';
import { Module, type DynamicModule } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { TestingModule } from './modules/testing/testing.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig, Environments } from './core/core.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        uri: coreConfig.mongoURI,
        dbName: coreConfig.dbName,
      }),
    }),
    CoreModule,
    BloggersPlatformModule,
    UserAccountsModule,
    CqrsModule.forRoot(),
    configModule,
  ],
})
export class AppModule {
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    const includeTestingModule =
      coreConfig.env === Environments.TESTING &&
      coreConfig.includeTestingModule;

    return {
      module: AppModule,
      imports: includeTestingModule ? [TestingModule] : [],
    };
  }
}
