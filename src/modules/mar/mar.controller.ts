import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { MarService, UserContext } from './mar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('mar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarController {
  constructor(private marService: MarService) {}

  private getUserContext(req): UserContext {
    return {
      userId: req.user.id,
      role: req.user.role,
      employeeId: req.user.employee?.id,
    };
  }

  @Post()
  async createMarEntry(
    @Request() req,
    @Body() body: { 
      employeeId: string; 
      medicationName: string; 
      scheduledTime: string;
      participantId?: string;
    },
  ) {
    const userContext = this.getUserContext(req);
    return this.marService.createMarEntry(req.user.tenantId, req.user.id, body.employeeId, {
      medicationName: body.medicationName,
      scheduledTime: new Date(body.scheduledTime),
      participantId: body.participantId,
    }, userContext);
  }

  @Post(':id/outcome')
  async recordOutcome(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { outcome: 'given' | 'missed' | 'refused'; outcomeTime?: string; reasonNotGiven?: string },
  ) {
    const userContext = this.getUserContext(req);
    return this.marService.recordOutcome(req.user.tenantId, req.user.id, id, {
      ...body,
      outcomeTime: body.outcomeTime ? new Date(body.outcomeTime) : undefined,
    }, userContext);
  }

  @Post(':id/lock')
  @Roles('admin', 'manager', 'supervisor')
  async lockEntry(@Request() req, @Param('id') id: string) {
    const userContext = this.getUserContext(req);
    return this.marService.lockEntry(req.user.tenantId, req.user.id, id, userContext);
  }

  @Get()
  async getMarEntries(
    @Request() req,
    @Query('employeeId') employeeId?: string,
    @Query('outcome') outcome?: string,
    @Query('participantId') participantId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userContext = this.getUserContext(req);
    return this.marService.getMarEntries(req.user.tenantId, req.user.id, {
      employeeId,
      outcome,
      participantId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    }, userContext);
  }

  @Get(':id')
  async getMarEntry(@Request() req, @Param('id') id: string) {
    const userContext = this.getUserContext(req);
    return this.marService.getMarEntry(req.user.tenantId, id, userContext);
  }

  @Post('export')
  @Roles('admin', 'manager', 'supervisor')
  async exportMarEntries(
    @Request() req,
    @Body() body: { 
      startDate: string; 
      endDate: string; 
      employeeId?: string;
      participantId?: string;
    },
  ) {
    const userContext = this.getUserContext(req);
    return this.marService.exportMarEntries(
      req.user.tenantId,
      req.user.id,
      new Date(body.startDate),
      new Date(body.endDate),
      { employeeId: body.employeeId, participantId: body.participantId },
      userContext,
    );
  }
}
