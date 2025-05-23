import { registerAs } from '@nestjs/config';

import { IsOptional, IsString, ValidateIf, IsBoolean } from 'class-validator';
import validateConfig from '../../utils/validate-config';

export type DatabaseConfig = {
  url?: string;
  synchronize?: boolean;
};

class EnvironmentVariablesValidator {
  @ValidateIf((envValues) => envValues.DATABASE_URL)
  @IsString()
  DATABASE_URL: string;

  @ValidateIf((envValues) => !envValues.DATABASE_URL)
  @IsString()
  DATABASE_USERNAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_DROP_SCHEMA: boolean;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.DATABASE_URL,
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  };
});
