import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { InitiateMomoDto } from './dto/initiate-momo.dto';
import { MomoService } from './momo.service';

@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @Post('initiate')
  initiate(@Body() dto: InitiateMomoDto) {
    return this.momoService.initiate(dto);
  }

  @Get(':paymentId/status')
  getStatus(@Param('paymentId') paymentId: string) {
    return this.momoService.getStatus(paymentId);
  }
}
