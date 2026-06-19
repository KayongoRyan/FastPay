import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import mongoConfig from './mongo.config';

@Module({})
export class FastpayMongoModule {
  static forRoot(): DynamicModule {
    return {
      module: FastpayMongoModule,
      imports: [
        ConfigModule.forFeature(mongoConfig),
        MongooseModule.forRootAsync({
          imports: [ConfigModule.forFeature(mongoConfig)],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.getOrThrow<string>('mongo.uri'),
            dbName: configService.getOrThrow<string>('mongo.dbName'),
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
          }),
        }),
      ],
      exports: [MongooseModule],
    };
  }
}
