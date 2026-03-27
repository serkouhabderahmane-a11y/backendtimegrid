import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/config.module';
import * as bcrypt from 'bcryptjs';

export interface DemoUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'manager' | 'employee';
}

@Injectable()
export class SeedService {
  private demoUsers: DemoUserInput[] = [
    {
      email: process.env.DEMO_EMAIL || 'demo@timegrid.app',
      password: process.env.DEMO_PASSWORD || 'demo123',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'admin',
    },
    {
      email: process.env.DEMO_HR_EMAIL || 'hr@timegrid.app',
      password: process.env.DEMO_HR_PASSWORD || 'hr123',
      firstName: 'HR',
      lastName: 'Manager',
      role: 'hr',
    },
    {
      email: process.env.DEMO_EMPLOYEE_EMAIL || 'employee@timegrid.app',
      password: process.env.DEMO_EMPLOYEE_PASSWORD || 'employee123',
      firstName: 'John',
      lastName: 'Employee',
      role: 'employee',
    },
  ];

  constructor(private prisma: PrismaService) {}

  async seedDemoUsers(): Promise<void> {
    console.log('[Seed] Starting demo user seeding...');

    let tenant = await this.prisma.tenant.findFirst({
      where: { slug: 'demo-tenant' },
    });

    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          name: 'Demo Organization',
          slug: 'demo-tenant',
          settings: JSON.stringify({
            overtimeThreshold: 480,
            overtimeMultiplier: 1.5,
            defaultPayRate: 15,
          }),
        },
      });
      console.log('[Seed] Created demo tenant');
    }

    for (const demoUser of this.demoUsers) {
      try {
        const existingUser = await this.prisma.user.findFirst({
          where: { 
            tenantId: tenant!.id,
            email: demoUser.email 
          },
        });

        if (existingUser) {
          console.log(`[Seed] User ${demoUser.email} already exists, skipping...`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(demoUser.password, 10);

        const user = await this.prisma.user.create({
          data: {
            tenantId: tenant!.id,
            email: demoUser.email,
            passwordHash: hashedPassword,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            role: demoUser.role,
            isActive: true,
          },
        });

        await this.prisma.employee.create({
          data: {
            userId: user.id,
            tenantId: tenant!.id,
            employeeNumber: `EMP-${Date.now()}`,
            startDate: new Date(),
            canClockIn: true,
            onboardingStatus: 'employee_active',
          },
        });

        console.log(`[Seed] Created user: ${demoUser.email} (${demoUser.role})`);
      } catch (error) {
        console.error(`[Seed] Error creating user ${demoUser.email}:`, error.message);
      }
    }

    console.log('[Seed] Demo user seeding completed');
  }

  async getDemoCredentials() {
    return this.demoUsers.map(({ password, ...rest }) => ({
      ...rest,
      note: 'Use the password from environment variables or default passwords',
    }));
  }
}
