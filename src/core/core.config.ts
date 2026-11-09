import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  Max,
  Min,
} from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsInt({ message: 'PORT must be an integer' })
  @Min(1)
  @Max(65535)
  readonly port: number;

  @IsNotEmpty({
    message: 'Set Env variable MONGO_URL, example: mongodb://localhost:27017',
  })
  readonly mongoURI: string;

  @IsNotEmpty({ message: 'Set Env variable DB_NAME' })
  readonly dbName: string;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false',
  })
  readonly isSwaggerEnabled: boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  readonly includeTestingModule: boolean;

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  readonly env: Environments;

  constructor(configService: ConfigService) {
    this.port = Number(configService.getOrThrow<string>('PORT'));
    this.mongoURI = configService.getOrThrow<string>('MONGO_URL');
    this.dbName = configService.getOrThrow<string>('DB_NAME');
    this.env = configService.getOrThrow<Environments>('NODE_ENV');

    const isSwaggerEnabled = configValidationUtility.convertToBoolean(
      configService.get('IS_SWAGGER_ENABLED') ?? 'false',
    );
    if (isSwaggerEnabled === null) {
      throw new Error('IS_SWAGGER_ENABLED must be true or false');
    }
    this.isSwaggerEnabled = isSwaggerEnabled;

    const includeTestingModule = configValidationUtility.convertToBoolean(
      configService.get<string>('INCLUDE_TESTING_MODULE') ?? 'false',
    );
    if (includeTestingModule === null) {
      throw new Error('INCLUDE_TESTING_MODULE must be true or false');
    }
    this.includeTestingModule = includeTestingModule;

    configValidationUtility.validateConfig(this);
  }
}
