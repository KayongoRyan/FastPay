import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MomoPayment, MomoPaymentSchema } from '@fastpay/schemas';

import { MomoController } from './momo.controller';
import { MomoService } from './momo.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MomoPayment.name, schema: MomoPaymentSchema },
    ]),
  ],
  controllers: [MomoController],
  providers: [MomoService],
})
export class MomoModule {}
