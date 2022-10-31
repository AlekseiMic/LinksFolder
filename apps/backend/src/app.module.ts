import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { getDbConfig } from './sequelizeConfig';
import { MainModule } from 'main.module';

const envFilePath = resolve(__dirname + '/.env');

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    SequelizeModule.forRoot(
      getDbConfig(process.env['NODE_ENV'] ?? 'development')
    ),
    MainModule,
  ],
})
export class AppModule {}
