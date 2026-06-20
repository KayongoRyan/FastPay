import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { BiometricEnrollDto } from './dto/biometric-enroll.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { extractAuditContext } from './utils/request-context.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, extractAuditContext(req));
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, extractAuditContext(req));
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, extractAuditContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.logout(req.user.userId, extractAuditContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Post('biometric/enroll')
  enrollBiometric(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: BiometricEnrollDto,
  ) {
    return this.authService.enrollBiometric(
      req.user.userId,
      dto,
      extractAuditContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.getProfile(req.user.userId);
  }
}
