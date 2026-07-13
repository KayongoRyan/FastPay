import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUserId } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SecurityService } from './security.service';

@Controller('security')
@UseGuards(JwtAuthGuard)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('summary')
  summary(@CurrentUserId() userId: string) {
    return this.securityService.getSummary(userId);
  }

  @Get('sessions')
  sessions(
    @CurrentUserId() userId: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.securityService.listSessions(userId, sessionId);
  }

  @Delete('sessions/:sessionId')
  revokeSession(
    @CurrentUserId() userId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.securityService.revokeSession(userId, sessionId);
  }

  @Delete('sessions')
  revokeAll(
    @CurrentUserId() userId: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    return this.securityService.revokeOtherSessions(userId, sessionId);
  }

  @Get('devices')
  devices(@CurrentUserId() userId: string) {
    return this.securityService.listDevices(userId);
  }

  @Delete('devices/:deviceId')
  revokeDevice(
    @CurrentUserId() userId: string,
    @Param('deviceId') deviceId: string,
  ) {
    return this.securityService.revokeDevice(userId, deviceId);
  }

  @Get('alerts')
  alerts(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    return this.securityService.listAlerts(
      userId,
      limit ? Number(limit) : 20,
      cursor,
    );
  }

  @Patch('alerts/:id/read')
  markRead(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.securityService.markAlertRead(userId, id);
  }
}

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('events')
  events(
    @CurrentUserId() userId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('category') category?: string,
  ) {
    return this.securityService.listAuditEvents(
      userId,
      limit ? Number(limit) : 20,
      cursor,
      category,
    );
  }
}
