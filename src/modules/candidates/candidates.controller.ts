import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';

@Controller('tenants/:tenantId/candidates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Post()
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateCandidateDto,
    @Request() req,
  ) {
    return this.candidatesService.create(tenantId, dto, req.user.id);
  }

  @Get()
  async findAll(
    @Param('tenantId') tenantId: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
  ) {
    return this.candidatesService.findAll(tenantId, { state, search });
  }

  @Get(':id')
  async findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.candidatesService.findOne(tenantId, id);
  }

  @Post(':id/assign-packet')
  async assignPacket(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body('packetId') packetId: string,
    @Request() req,
  ) {
    return this.candidatesService.assignPacket(tenantId, id, packetId, req.user.id);
  }
}
