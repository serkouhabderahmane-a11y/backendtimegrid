import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    return this.chatService.getConversations(req.user.tenantId, req.user.id);
  }

  @Get('users')
  async getUsers(@Request() req, @Query('search') search?: string) {
    return this.chatService.getUsers(req.user.tenantId, req.user.id, search);
  }

  @Post('conversations')
  async createOrGetConversation(@Request() req, @Body() body: { userId: string }) {
    return this.chatService.getOrCreateConversation(req.user.tenantId, req.user.id, body.userId);
  }

  @Get('conversations/:id')
  async getConversation(@Request() req, @Param('id') id: string) {
    return this.chatService.getConversation(id, req.user.tenantId, req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.getMessages(
      id,
      req.user.tenantId,
      req.user.id,
      limit ? parseInt(limit) : 50,
      before,
    );
  }

  @Post('conversations/:id/messages')
  async sendMessage(@Request() req, @Param('id') id: string, @Body() body: { content: string }) {
    return this.chatService.sendMessage(id, req.user.tenantId, req.user.id, body.content);
  }

  @Post('conversations/:id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.chatService.markAsRead(id, req.user.tenantId, req.user.id);
  }

  @Get('unread')
  async getUnreadCount(@Request() req) {
    return { count: await this.chatService.getUnreadCount(req.user.tenantId, req.user.id) };
  }
}
