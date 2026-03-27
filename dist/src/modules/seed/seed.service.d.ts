import { PrismaService } from '../../config/config.module';
export interface DemoUserInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'hr' | 'manager' | 'employee';
}
export declare class SeedService {
    private prisma;
    private demoUsers;
    constructor(prisma: PrismaService);
    seedDemoUsers(): Promise<void>;
    getDemoCredentials(): Promise<{
        note: string;
        email: string;
        firstName: string;
        lastName: string;
        role: "admin" | "hr" | "manager" | "employee";
    }[]>;
}
