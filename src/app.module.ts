import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesS3Module } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './orders/order.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import AppConfig from './config/app.config';
import fileConfig from './files/config/file.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, AppConfig, fileConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    FilesS3Module,
    AuthModule,
    OrderModule,
  ],
})
export class AppModule {}
