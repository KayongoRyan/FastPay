import { Body, Controller, Post } from '@nestjs/common';

import { ChainalysisMockService } from './chainalysis-mock.service';
import { ScreenAddressDto } from './dto/screen-address.dto';

@Controller('compliance/chainalysis')
export class ChainalysisMockController {
  constructor(private readonly chainalysisMockService: ChainalysisMockService) {}

  @Post('screen')
  screen(@Body() dto: ScreenAddressDto) {
    return this.chainalysisMockService.screen(dto);
  }
}
