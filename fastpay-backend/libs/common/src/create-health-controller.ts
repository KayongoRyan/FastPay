import { Controller, Get } from '@nestjs/common';

export function createHealthController(serviceName: string) {
  @Controller()
  class ServiceHealthController {
    @Get()
    health() {
      return { status: 'ok', service: serviceName };
    }

    @Get('health')
    healthCheck() {
      return { status: 'ok', service: serviceName };
    }
  }

  return ServiceHealthController;
}
