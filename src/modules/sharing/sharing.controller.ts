import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sharing')
export class SharingController {
  constructor(private sharingService: SharingService) {}

  @Post('create-link')
  @UseGuards(JwtAuthGuard)
  async createShareLink(
    @Request() req,
    @Body() body: { entityType: 'daily_note' | 'mar'; entityId: string; expiresInHours?: number },
  ) {
    return this.sharingService.createShareLink(
      req.user.tenantId,
      req.user.id,
      body.entityType,
      body.entityId,
      body.expiresInHours || 24,
    );
  }

  @Get('active-links')
  @UseGuards(JwtAuthGuard)
  async getActiveShareLinks(@Request() req) {
    return this.sharingService.getActiveShareLinks(req.user.tenantId, req.user.id);
  }

  @Post('revoke/:token')
  @UseGuards(JwtAuthGuard)
  async revokeShareLink(@Request() req, @Param('token') token: string) {
    return this.sharingService.revokeShareLink(req.user.tenantId, req.user.id, token);
  }

  @Get('access/:token')
  async accessSharedContent(@Param('token') token: string) {
    return this.sharingService.accessSharedContent(token);
  }
}
