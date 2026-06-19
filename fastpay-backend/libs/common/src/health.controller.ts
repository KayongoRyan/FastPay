import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  constructor(private readonly serviceName: string) {}

  @Get()
  health() {
    return { status: 'ok', service: this.serviceName };
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: this.serviceName };
  }
}
