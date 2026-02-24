import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MarService } from './mar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('mar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarController {
  constructor(private marService: MarService) {}

  @Post()
  async createMarEntry(
    @Request() req,
    @Body() body: { employeeId: string; medicationName: string; scheduledTime: string },
  ) {
    return this.marService.createMarEntry(req.user.tenantId, req.user.id, body.employeeId, {
      medicationName: body.medicationName,
      scheduledTime: new Date(body.scheduledTime),
    });
  }

  @Post(':id/outcome')
  async recordOutcome(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { outcome: 'given' | 'missed' | 'refused'; outcomeTime?: string; reasonNotGiven?: string },
  ) {
    return this.marService.recordOutcome(req.user.tenantId, req.user.id, id, {
      ...body,
      outcomeTime: body.outcomeTime ? new Date(body.outcomeTime) : undefined,
    });
  }

  @Post(':id/lock')
  @Roles('admin', 'hr', 'manager')
  async lockEntry(@Request() req, @Param('id') id: string) {
    return this.marService.lockEntry(req.user.tenantId, req.user.id, id);
  }

  @Get()
  async getMarEntries(
    @Request() req,
    @Query('employeeId') employeeId?: string,
    @Query('outcome') outcome?: string,
  ) {
    return this.marService.getMarEntries(req.user.tenantId, employeeId, outcome);
  }

  @Get(':id')
  async getMarEntry(@Request() req, @Param('id') id: string) {
    return this.marService.getMarEntry(req.user.tenantId, id);
  }

  @Post('export')
  @Roles('admin', 'hr', 'manager')
  async exportMarEntries(
    @Request() req,
    @Body() body: { startDate: string; endDate: string; employeeId?: string },
  ) {
    return this.marService.exportMarEntries(
      req.user.tenantId,
      req.user.id,
      new Date(body.startDate),
      new Date(body.endDate),
      body.employeeId,
    );
  }
}
