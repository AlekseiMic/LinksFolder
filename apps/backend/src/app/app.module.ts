import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { LinkModule } from '../link/link.module';

const envFilePath = resolve(__dirname + '/common/env/.env');

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123qwe123',
      database: 'linkfolder',
      autoLoadModels: true,
      dialectOptions: {
        multipleStatements: true,
      },
      models: [],
    }),
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    AuthModule,
    LinkModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
