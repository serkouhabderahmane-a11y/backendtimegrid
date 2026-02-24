import { Controller, Post, Get, UseGuards, Request, Query } from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private timeEntriesService: TimeEntriesService) {}

  @Post('clock-in')
  async clockIn(@Request() req) {
    return this.timeEntriesService.clockIn(req.user.id, req.user.tenantId);
  }

  @Post('clock-out')
  async clockOut(@Request() req) {
    return this.timeEntriesService.clockOut(req.user.id, req.user.tenantId);
  }

  @Get('today')
  async getTodayEntry(@Request() req) {
    return this.timeEntriesService.getTodayEntry(req.user.id, req.user.tenantId);
  }

  @Get()
  async getEntries(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeEntriesService.getEntries(
      req.user.id,
      req.user.tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
