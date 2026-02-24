import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'demo-tenant-1' },
    update: {},
    create: {
      id: 'demo-tenant-1',
      name: 'Demo Company',
      slug: 'demo-company',
      settings: '{}',
    },
  });

  console.log('Created tenant:', tenant.id);

  // Create demo HR user
  const hrUser = await prisma.user.upsert({
    where: { id: 'demo-hr-1' },
    update: {},
    create: {
      id: 'demo-hr-1',
      tenantId: 'demo-tenant-1',
      email: 'hr@demo.com',
      passwordHash: '$2b$10$dummy', // dummy hash for demo
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'hr',
      isActive: true,
    },
  });

  console.log('Created HR user:', hrUser.email);

  // Create demo employee user
  const employeeUser = await prisma.user.upsert({
    where: { id: 'demo-employee-1' },
    update: {},
    create: {
      id: 'demo-employee-1',
      tenantId: 'demo-tenant-1',
      email: 'john@demo.com',
      passwordHash: '$2b$10$dummy',
      firstName: 'John',
      lastName: 'Smith',
      role: 'employee',
      isActive: true,
    },
  });

  console.log('Created employee user:', employeeUser.email);

  // Create demo location
  const location = await prisma.location.upsert({
    where: { tenantId_name: { tenantId: 'demo-tenant-1', name: 'Main Office' } },
    update: {},
    create: {
      id: 'demo-location-1',
      tenantId: 'demo-tenant-1',
      name: 'Main Office',
      address: '123 Demo Street',
      isActive: true,
    },
  });

  console.log('Created location:', location.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
