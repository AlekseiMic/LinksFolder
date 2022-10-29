import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { LinkModule } from 'link/link.module';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDbConfig } from './sequelizeConfig';

const envFilePath = resolve(__dirname + '/.env');

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    SequelizeModule.forRoot(
      getDbConfig(process.env['NODE_ENV'] ?? 'development')
    ),
    AuthModule,
    LinkModule,
  ],
})
export class AppModule {}
