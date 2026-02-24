"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
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
    const hrUser = await prisma.user.upsert({
        where: { id: 'demo-hr-1' },
        update: {},
        create: {
            id: 'demo-hr-1',
            tenantId: 'demo-tenant-1',
            email: 'hr@demo.com',
            passwordHash: '$2b$10$dummy',
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'hr',
            isActive: true,
        },
    });
    console.log('Created HR user:', hrUser.email);
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
//# sourceMappingURL=seed.js.map