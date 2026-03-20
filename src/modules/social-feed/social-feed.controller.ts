import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialFeedService } from './social-feed.service';

@Controller('social-feed')
@UseGuards(JwtAuthGuard)
export class SocialFeedController {
  constructor(private readonly socialFeedService: SocialFeedService) {}

  @Get('posts')
  async getPosts(@Request() req) {
    return this.socialFeedService.getPosts(req.user.tenantId);
  }

  @Post('posts')
  async createPost(@Request() req, @Body() body: { content: string; imageUrl?: string }) {
    return this.socialFeedService.createPost(req.user.tenantId, req.user.id, body);
  }

  @Put('posts/:id')
  async updatePost(@Request() req, @Param('id') id: string, @Body() body: { content?: string; imageUrl?: string; isPinned?: boolean }) {
    return this.socialFeedService.updatePost(id, req.user.tenantId, req.user.id, req.user.role, body);
  }

  @Delete('posts/:id')
  async deletePost(@Request() req, @Param('id') id: string) {
    return this.socialFeedService.deletePost(id, req.user.tenantId, req.user.id, req.user.role);
  }

  @Post('posts/:id/reactions')
  async addReaction(@Request() req, @Param('id') id: string, @Body() body: { type: string }) {
    return this.socialFeedService.addReaction(id, req.user.tenantId, req.user.id, body.type);
  }

  @Delete('posts/:id/reactions')
  async removeReaction(@Request() req, @Param('id') id: string, @Body() body: { type: string }) {
    return this.socialFeedService.removeReaction(id, req.user.id, body.type);
  }

  @Post('posts/:id/comments')
  async addComment(@Request() req, @Param('id') id: string, @Body() body: { content: string }) {
    return this.socialFeedService.addComment(id, req.user.tenantId, req.user.id, body.content);
  }

  @Delete('comments/:id')
  async deleteComment(@Request() req, @Param('id') id: string) {
    return this.socialFeedService.deleteComment(id, req.user.tenantId, req.user.id, req.user.role);
  }
}
