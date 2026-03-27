import { Controller, Get, Post, Patch, Delete, UseGuards, Request, Param, Body, Query } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateHolidayDto,
  UpdateHolidayDto,
  AssignHolidayDto,
  HolidayQueryDto,
} from './dto/holidays.dto';

@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidaysController {
  constructor(private holidaysService: HolidaysService) {}

  @Post()
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async createHoliday(@Request() req, @Body() dto: CreateHolidayDto) {
    return this.holidaysService.createHoliday(req.user.tenantId, dto, req.user.id);
  }

  @Get()
  async getHolidays(@Request() req, @Query() query: HolidayQueryDto) {
    return this.holidaysService.getHolidays(req.user.tenantId, query);
  }

  @Get(':id')
  async getHoliday(@Request() req, @Param('id') id: string) {
    return this.holidaysService.getHoliday(req.user.tenantId, id);
  }

  @Patch(':id')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async updateHoliday(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.holidaysService.updateHoliday(req.user.tenantId, id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async disableHoliday(@Request() req, @Param('id') id: string) {
    return this.holidaysService.disableHoliday(req.user.tenantId, id, req.user.id);
  }

  @Post(':id/assignments')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async assignHoliday(@Request() req, @Param('id') id: string, @Body() dto: AssignHolidayDto) {
    return this.holidaysService.assignHoliday(req.user.tenantId, id, dto, req.user.id);
  }

  @Get(':id/assignments')
  async getHolidayAssignments(@Request() req, @Param('id') id: string) {
    return this.holidaysService.getHolidayAssignments(req.user.tenantId, id);
  }

  @Delete('assignments/:assignmentId')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async removeAssignment(@Request() req, @Param('assignmentId') assignmentId: string) {
    return this.holidaysService.removeAssignment(req.user.tenantId, assignmentId, req.user.id);
  }

  @Get('upcoming/my')
  async getUpcomingHolidays(@Request() req) {
    return this.holidaysService.getUpcomingHolidays(req.user.tenantId);
  }

  @Get('admin/departments')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async getAllDepartments(@Request() req) {
    return this.holidaysService.getAllDepartments(req.user.tenantId);
  }

  @Get('admin/locations')
  @Roles('admin', 'hr')
  @UseGuards(RolesGuard)
  async getAllLocations(@Request() req) {
    return this.holidaysService.getAllLocations(req.user.tenantId);
  }
}
