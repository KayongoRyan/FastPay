import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtVerifierService } from '../auth/jwt-verifier.service';
import { ChatService } from './chat.service';
import { ChatRequestDto, RebuildIndexDto } from './dto/chat.dto';

@Controller('assistant')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtVerifier: JwtVerifierService,
  ) {}

  @Post('chat')
  chat(
    @Headers('authorization') authorization: string,
    @Body() dto: ChatRequestDto,
  ) {
    const userId = this.jwtVerifier.verifyAccessToken(authorization);
    return this.chatService.chat(userId, dto, authorization);
  }

  @Post('index/rebuild')
  async rebuildIndex(@Body() dto: RebuildIndexDto) {
    try {
      return await this.chatService.rebuildGlobalIndex(dto.secret);
    } catch {
      throw new UnauthorizedException('Invalid index rebuild secret');
    }
  }

  @Post('index/user')
  rebuildUserIndex(@Headers('authorization') authorization: string) {
    const userId = this.jwtVerifier.verifyAccessToken(authorization);
    return this.chatService.rebuildUserIndex(userId, authorization);
  }
}
