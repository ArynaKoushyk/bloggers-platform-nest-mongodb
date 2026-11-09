import { NestFactory } from '@nestjs/core';
import { setupApp } from './setup/app.setup';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule);
  const coreConfig = app.get<CoreConfig>(CoreConfig);
  setupApp(app, coreConfig.isSwaggerEnabled);

  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
void bootstrap();
