import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug: string; domain?: string }) {
    const existing = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { slug: data.slug },
          ...(data.domain ? [{ domain: data.domain }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('Tenant with this slug or domain already exists');
    }

    return this.prisma.tenant.create({
      data,
    });
  }

  async findByDomain(domain: string) {
    return this.prisma.tenant.findUnique({
      where: { domain },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getLocations(tenantId: string) {
    return this.prisma.location.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getDepartments(tenantId: string) {
    return this.prisma.department.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getOnboardingPackets(tenantId: string) {
    return this.prisma.onboardingPacket.findMany({
      where: { tenantId, isActive: true },
      include: { assignments: false },
      orderBy: { name: 'asc' },
    });
  }

  async getOnboardingTasks(tenantId: string) {
    return this.prisma.onboardingTask.findMany({
      where: { tenantId, isActive: true },
      orderBy: { order: 'asc' },
    });
  }
}
