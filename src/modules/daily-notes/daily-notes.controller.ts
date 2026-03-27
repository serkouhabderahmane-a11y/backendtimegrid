import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DailyNotesService, UserContext } from './daily-notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('daily-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DailyNotesController {
  constructor(private dailyNotesService: DailyNotesService) {}

  private getUserContext(req): UserContext {
    return {
      userId: req.user.id,
      role: req.user.role,
      employeeId: req.user.employee?.id,
    };
  }

  @Post()
  async createNote(
    @Request() req,
    @Body() body: { 
      employeeId?: string;
      date: string; 
      content: string; 
      attachments?: string[];
      participantId?: string;
    },
  ) {
    const userContext = this.getUserContext(req);
    const employeeId = body.employeeId || userContext.employeeId;
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    return this.dailyNotesService.createNote(req.user.tenantId, req.user.id, employeeId, {
      content: body.content,
      date: new Date(body.date),
      attachments: body.attachments,
      participantId: body.participantId,
    }, userContext);
  }

  @Put(':id')
  async updateNote(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { 
      content?: string; 
      date?: string;
      attachments?: string[];
      participantId?: string;
    },
  ) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.updateNote(req.user.tenantId, req.user.id, id, {
      content: body.content,
      date: body.date ? new Date(body.date) : undefined,
      attachments: body.attachments,
      participantId: body.participantId,
    }, userContext);
  }

  @Post(':id/submit')
  async submitNote(@Request() req, @Param('id') id: string) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.submitNote(req.user.tenantId, req.user.id, id, userContext);
  }

  @Get()
  async getNotes(
    @Request() req,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('participantId') participantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.getNotes(req.user.tenantId, req.user.id, {
      employeeId,
      status,
      participantId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }, userContext);
  }

  @Get(':id')
  async getNote(@Request() req, @Param('id') id: string) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.getNote(req.user.tenantId, id, userContext);
  }

  @Post(':id/review')
  @Roles('admin', 'manager', 'supervisor')
  async reviewNote(@Request() req, @Param('id') id: string) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.reviewNote(req.user.tenantId, req.user.id, id, userContext);
  }

  @Post(':id/lock')
  @Roles('admin', 'manager', 'supervisor')
  async lockNote(@Request() req, @Param('id') id: string) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.lockNote(req.user.tenantId, req.user.id, id, userContext);
  }

  @Post('export')
  @Roles('admin', 'manager', 'supervisor')
  async exportNotes(
    @Request() req,
    @Body() body: { startDate: string; endDate: string; participantId?: string },
  ) {
    const userContext = this.getUserContext(req);
    return this.dailyNotesService.exportNotes(
      req.user.tenantId,
      req.user.id,
      new Date(body.startDate),
      new Date(body.endDate),
      { participantId: body.participantId },
      userContext,
    );
  }
}
