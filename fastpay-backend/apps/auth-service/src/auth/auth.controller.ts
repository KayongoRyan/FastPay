import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { BiometricChallengeQueryDto } from './dto/biometric-challenge-query.dto';
import { BiometricEnrollDto } from './dto/biometric-enroll.dto';
import { BiometricLoginDto } from './dto/biometric-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { RegisterBusinessDto } from './dto/register-business.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { extractAuditContext } from './utils/request-context.util';
import { VerificationService } from './verification/verification.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.authService.register(dto, extractAuditContext(req));
  }

  @Post('register/merchant')
  registerMerchant(@Body() dto: RegisterMerchantDto, @Req() req: Request) {
    return this.authService.registerMerchant(dto, extractAuditContext(req));
  }

  @Post('register/business')
  registerBusiness(@Body() dto: RegisterBusinessDto, @Req() req: Request) {
    return this.authService.registerBusiness(dto, extractAuditContext(req));
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

  @Get('biometric/challenge')
  biometricChallenge(@Query() query: BiometricChallengeQueryDto) {
    return this.authService.createBiometricChallenge(query.deviceId);
  }

  @Post('biometric/login')
  biometricLogin(@Body() dto: BiometricLoginDto, @Req() req: Request) {
    return this.authService.biometricLogin(dto, extractAuditContext(req));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-password')
  verifyPassword(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: VerifyPasswordDto,
  ) {
    return this.authService.verifyPassword(
      req.user.userId,
      dto.password,
      extractAuditContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      dto,
      extractAuditContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('freeze-account')
  freezeAccount(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.freezeAccount(
      req.user.userId,
      extractAuditContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfreeze-account')
  unfreezeAccount(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.authService.unfreezeAccount(
      req.user.userId,
      extractAuditContext(req),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('verification/send-otp')
  sendVerificationOtp(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.verificationService.sendEmailOtp(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verification/verify-otp')
  verifyEmailOtp(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: VerifyOtpDto,
  ) {
    return this.verificationService.verifyEmailOtp(req.user.userId, dto.code);
  }
}
