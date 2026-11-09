import { INestApplication } from '@nestjs/common';
import { setupGlobalPipes } from './pipes.setup';
import { setupGlobalPrefix } from './global-prefix.setup';
import { setupSwagger } from './swagger.setup';
import cookieParser from 'cookie-parser';
export function setupApp(app: INestApplication, isSwaggerEnabled: boolean) {
  app.use(cookieParser());
  setupGlobalPipes(app);
  // setupGlobalPrefix(app);
  setupSwagger(app, isSwaggerEnabled);
}
