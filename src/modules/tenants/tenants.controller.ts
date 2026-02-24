import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/guards/roles.guard';

@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  create(@Body() data: { name: string; slug: string; domain?: string }) {
    return this.tenantsService.create(data);
  }

  @Get('domain/:domain')
  async findByDomain(@Param('domain') domain: string) {
    return this.tenantsService.findByDomain(domain);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Get(':tenantId/locations')
  async getLocations(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getLocations(tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Get(':tenantId/departments')
  async getDepartments(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getDepartments(tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Get(':tenantId/onboarding-packets')
  async getOnboardingPackets(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getOnboardingPackets(tenantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  @Get(':tenantId/onboarding-tasks')
  async getOnboardingTasks(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getOnboardingTasks(tenantId);
  }
}
