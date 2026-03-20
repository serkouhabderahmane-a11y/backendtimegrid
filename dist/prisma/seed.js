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
    const passwordHash = '$2b$10$dummy';
    const hrUser = await prisma.user.upsert({
        where: { id: 'demo-hr-1' },
        update: {},
        create: {
            id: 'demo-hr-1',
            tenantId: 'demo-tenant-1',
            email: 'hr@demo.com',
            passwordHash,
            firstName: 'Sarah',
            lastName: 'Johnson',
            role: 'hr',
            isActive: true,
        },
    });
    console.log('Created HR user:', hrUser.email);
    const adminUser = await prisma.user.upsert({
        where: { id: 'demo-admin-1' },
        update: {},
        create: {
            id: 'demo-admin-1',
            tenantId: 'demo-tenant-1',
            email: 'admin@demo.com',
            passwordHash,
            firstName: 'Michael',
            lastName: 'Chen',
            role: 'admin',
            isActive: true,
        },
    });
    console.log('Created admin user:', adminUser.email);
    const managerUser = await prisma.user.upsert({
        where: { id: 'demo-manager-1' },
        update: {},
        create: {
            id: 'demo-manager-1',
            tenantId: 'demo-tenant-1',
            email: 'manager@demo.com',
            passwordHash,
            firstName: 'Emily',
            lastName: 'Davis',
            role: 'manager',
            isActive: true,
        },
    });
    console.log('Created manager user:', managerUser.email);
    const employees = [
        { id: 'demo-employee-1', firstName: 'John', lastName: 'Smith', email: 'john@demo.com', role: 'employee' },
        { id: 'demo-employee-2', firstName: 'Lisa', lastName: 'Brown', email: 'lisa@demo.com', role: 'employee' },
        { id: 'demo-employee-3', firstName: 'David', lastName: 'Wilson', email: 'david@demo.com', role: 'employee' },
        { id: 'demo-employee-4', firstName: 'Anna', lastName: 'Martinez', email: 'anna@demo.com', role: 'employee' },
    ];
    for (const emp of employees) {
        await prisma.user.upsert({
            where: { id: emp.id },
            update: {},
            create: {
                id: emp.id,
                tenantId: 'demo-tenant-1',
                email: emp.email,
                passwordHash,
                firstName: emp.firstName,
                lastName: emp.lastName,
                role: emp.role,
                isActive: true,
            },
        });
        console.log('Created employee:', emp.email);
    }
    await prisma.location.upsert({
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
    await prisma.department.upsert({
        where: { tenantId_name: { tenantId: 'demo-tenant-1', name: 'Engineering' } },
        update: {},
        create: {
            id: 'demo-dept-1',
            tenantId: 'demo-tenant-1',
            name: 'Engineering',
            isActive: true,
        },
    });
    console.log('Created location and department');
    const posts = [
        {
            id: 'demo-post-1',
            tenantId: 'demo-tenant-1',
            authorId: 'demo-admin-1',
            content: '🎉 Welcome to our new HR platform! This is your central hub for all employee management, time tracking, and company announcements. Feel free to explore and let us know if you have any questions!',
            isPinned: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'demo-post-2',
            tenantId: 'demo-tenant-1',
            authorId: 'demo-hr-1',
            content: '📢 Important Reminder: Please submit your timesheets by Friday at 5 PM. Late submissions may delay payroll processing. Contact HR if you need any assistance!',
            isPinned: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'demo-post-3',
            tenantId: 'demo-tenant-1',
            authorId: 'demo-manager-1',
            content: 'Great job team on completing the Q1 deliverables! 🎯 Your hard work and dedication are truly appreciated. Let\'s keep up the momentum!',
            isPinned: false,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
            id: 'demo-post-4',
            tenantId: 'demo-tenant-1',
            authorId: 'demo-employee-1',
            content: '☕ Coffee run! Anyone want to join me at the new cafe down the street? They have amazing lattes!',
            isPinned: false,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
    ];
    for (const post of posts) {
        await prisma.post.upsert({
            where: { id: post.id },
            update: {},
            create: post,
        });
        console.log('Created post:', post.id);
    }
    const reactions = [
        { postId: 'demo-post-1', userId: 'demo-hr-1', type: 'love' },
        { postId: 'demo-post-1', userId: 'demo-manager-1', type: 'celebrate' },
        { postId: 'demo-post-1', userId: 'demo-employee-1', type: 'like' },
        { postId: 'demo-post-1', userId: 'demo-employee-2', type: 'celebrate' },
        { postId: 'demo-post-2', userId: 'demo-employee-1', type: 'like' },
        { postId: 'demo-post-3', userId: 'demo-hr-1', type: 'love' },
        { postId: 'demo-post-3', userId: 'demo-employee-2', type: 'celebrate' },
        { postId: 'demo-post-3', userId: 'demo-employee-3', type: 'celebrate' },
        { postId: 'demo-post-4', userId: 'demo-hr-1', type: 'love' },
        { postId: 'demo-post-4', userId: 'demo-employee-3', type: 'like' },
    ];
    for (const reaction of reactions) {
        await prisma.postReaction.create({
            data: reaction,
        }).catch(() => { });
    }
    const comments = [
        { postId: 'demo-post-1', userId: 'demo-hr-1', content: 'This looks amazing! Great work on the setup!' },
        { postId: 'demo-post-1', userId: 'demo-employee-1', content: 'Excited to try this out! 👀' },
        { postId: 'demo-post-1', userId: 'demo-manager-1', content: 'Finally! This will make things so much easier.' },
        { postId: 'demo-post-2', userId: 'demo-employee-2', content: 'Will do! Thanks for the reminder.' },
        { postId: 'demo-post-3', userId: 'demo-admin-1', content: 'Team effort! Couldn\'t be prouder of everyone. 💪' },
        { postId: 'demo-post-4', userId: 'demo-employee-2', content: 'Count me in! 🙋' },
        { postId: 'demo-post-4', userId: 'demo-employee-4', content: 'I\'ll join too!' },
    ];
    for (const comment of comments) {
        await prisma.postComment.create({
            data: {
                id: `demo-comment-${Math.random().toString(36).substr(2, 9)}`,
                ...comment,
                createdAt: new Date(),
            },
        });
    }
    console.log('Added reactions and comments');
    await prisma.conversation.create({
        data: {
            id: 'demo-conv-1',
            tenantId: 'demo-tenant-1',
            participants: {
                create: [
                    { userId: 'demo-hr-1' },
                    { userId: 'demo-employee-1' },
                ],
            },
        },
    });
    await prisma.message.createMany({
        data: [
            {
                id: 'demo-msg-1',
                conversationId: 'demo-conv-1',
                senderId: 'demo-hr-1',
                content: 'Hi John! Just wanted to check in - how\'s your onboarding going?',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
            {
                id: 'demo-msg-2',
                conversationId: 'demo-conv-1',
                senderId: 'demo-employee-1',
                content: 'Hi Sarah! It\'s going great, thank you for asking!',
                createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
            },
            {
                id: 'demo-msg-3',
                conversationId: 'demo-conv-1',
                senderId: 'demo-hr-1',
                content: 'That\'s wonderful to hear! Let me know if you have any questions.',
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            },
        ],
    });
    await prisma.conversation.create({
        data: {
            id: 'demo-conv-2',
            tenantId: 'demo-tenant-1',
            participants: {
                create: [
                    { userId: 'demo-admin-1' },
                    { userId: 'demo-manager-1' },
                ],
            },
        },
    });
    await prisma.message.createMany({
        data: [
            {
                id: 'demo-msg-4',
                conversationId: 'demo-conv-2',
                senderId: 'demo-admin-1',
                content: 'Emily, can we discuss the Q2 hiring plan tomorrow?',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
            {
                id: 'demo-msg-5',
                conversationId: 'demo-conv-2',
                senderId: 'demo-manager-1',
                content: 'Of course! I\'ll prepare the documentation beforehand.',
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            },
        ],
    });
    await prisma.conversation.create({
        data: {
            id: 'demo-conv-3',
            tenantId: 'demo-tenant-1',
            participants: {
                create: [
                    { userId: 'demo-employee-1' },
                    { userId: 'demo-employee-2' },
                ],
            },
        },
    });
    await prisma.message.createMany({
        data: [
            {
                id: 'demo-msg-6',
                conversationId: 'demo-conv-3',
                senderId: 'demo-employee-2',
                content: 'Hey John! Are you free for lunch today?',
                createdAt: new Date(Date.now() - 30 * 60 * 1000),
            },
            {
                id: 'demo-msg-7',
                conversationId: 'demo-conv-3',
                senderId: 'demo-employee-1',
                content: 'Sure! Meet at the cafeteria in 30?',
                createdAt: new Date(Date.now() - 15 * 60 * 1000),
            },
        ],
    });
    console.log('Created demo conversations and messages');
    console.log('\n✅ Demo data seeded successfully!');
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