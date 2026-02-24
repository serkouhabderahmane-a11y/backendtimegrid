import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DailyNotesService } from './daily-notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('daily-notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DailyNotesController {
  constructor(private dailyNotesService: DailyNotesService) {}

  @Post()
  async createNote(
    @Request() req,
    @Body() body: { employeeId: string; date: string; content: string; attachments?: string[] },
  ) {
    return this.dailyNotesService.createNote(req.user.tenantId, req.user.id, body.employeeId, {
      ...body,
      date: new Date(body.date),
    });
  }

  @Post(':id/submit')
  async submitNote(@Request() req, @Param('id') id: string) {
    return this.dailyNotesService.submitNote(req.user.tenantId, req.user.id, id);
  }

  @Get()
  async getNotes(
    @Request() req,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.dailyNotesService.getNotes(req.user.tenantId, employeeId, status);
  }

  @Get(':id')
  async getNote(@Request() req, @Param('id') id: string) {
    return this.dailyNotesService.getNote(req.user.tenantId, id);
  }

  @Post(':id/review')
  @Roles('admin', 'hr', 'manager')
  async reviewNote(@Request() req, @Param('id') id: string) {
    return this.dailyNotesService.reviewNote(req.user.tenantId, req.user.id, id);
  }

  @Post(':id/lock')
  @Roles('admin', 'hr', 'manager')
  async lockNote(@Request() req, @Param('id') id: string) {
    return this.dailyNotesService.lockNote(req.user.tenantId, req.user.id, id);
  }

  @Post('export')
  @Roles('admin', 'hr', 'manager')
  async exportNotes(
    @Request() req,
    @Body() body: { startDate: string; endDate: string },
  ) {
    return this.dailyNotesService.exportNotes(
      req.user.tenantId,
      req.user.id,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }
}
