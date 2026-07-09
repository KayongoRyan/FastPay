import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';

import { JwtVerifierService } from '../auth/jwt-verifier.service';
import { UploadKycDocumentDto } from './dto/upload-kyc-document.dto';
import { KycService } from './kyc.service';

@Controller('kyc')
export class KycController {
  constructor(
    private readonly kycService: KycService,
    private readonly jwtVerifier: JwtVerifierService,
  ) {}

  @Post('documents')
  uploadDocument(
    @Headers('authorization') authorization: string,
    @Body() dto: UploadKycDocumentDto,
  ) {
    const userId = this.jwtVerifier.verifyAccessToken(authorization);
    return this.kycService.uploadDocument(userId, dto);
  }

  @Get('status')
  getStatus(@Headers('authorization') authorization: string) {
    const userId = this.jwtVerifier.verifyAccessToken(authorization);
    return this.kycService.getStatus(userId);
  }
}
