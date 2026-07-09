import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OfflineRelay, OfflineRelaySchema } from '@fastpay/schemas';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OfflineRelay.name, schema: OfflineRelaySchema },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
