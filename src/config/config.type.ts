import { AppConfig } from './app-config.type';
import { AuthConfig } from '../auth/config/auth.config';
import { DatabaseConfig } from '../database/config/database.config';
import { FileConfig } from '../files/config/file-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
  file: FileConfig;
};
