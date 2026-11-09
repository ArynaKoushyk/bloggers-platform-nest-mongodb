import { Module, type DynamicModule } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configModule } from './config-dynamic-module';
import { CoreConfig } from './core/core.config';

@Module({
  imports: [configModule],
  providers: [CoreConfig],
})
class ConfigBootstrapModule {}

export async function initAppModule(): Promise<DynamicModule> {
  const appContext = await NestFactory.createApplicationContext(
    ConfigBootstrapModule,
  );

  try {
    const coreConfig = appContext.get(CoreConfig);
    return AppModule.forRoot(coreConfig);
  } finally {
    await appContext.close();
  }
}
