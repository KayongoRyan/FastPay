import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

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
          useFactory: (configService: ConfigService): MongooseModuleFactoryOptions => {
            const options: MongooseModuleFactoryOptions = {
              uri: configService.getOrThrow<string>('mongo.uri'),
              dbName: configService.getOrThrow<string>('mongo.dbName'),
              serverSelectionTimeoutMS: 5000,
              connectTimeoutMS: 10000,
            };

            if (configService.get<boolean>('mongo.tls')) {
              options.tls = true;
              const ca = configService.get<string>('mongo.tlsCAFile');
              if (ca) options.tlsCAFile = ca;
              if (configService.get<boolean>('mongo.tlsAllowInvalidCertificates')) {
                options.tlsAllowInvalidCertificates = true;
              }
            }

            return options;
          },
        }),
      ],
      exports: [MongooseModule],
    };
  }
}
