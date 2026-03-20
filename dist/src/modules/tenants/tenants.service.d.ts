import { PrismaService } from '../../config/config.module';
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        slug: string;
        domain?: string;
    }): Promise<{
        id: string;
        slug: string;
        domain: string | null;
        name: string;
        settings: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByDomain(domain: string): Promise<{
        id: string;
        slug: string;
        domain: string | null;
        name: string;
        settings: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findBySlug(slug: string): Promise<{
        id: string;
        slug: string;
        domain: string | null;
        name: string;
        settings: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findAll(): Promise<{
        id: string;
        slug: string;
        domain: string | null;
        name: string;
        settings: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getLocations(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        address: string | null;
    }[]>;
    getDepartments(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
    }[]>;
    getOnboardingPackets(tenantId: string): Promise<({} & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tasks: string;
        tenantId: string;
        isActive: boolean;
        description: string | null;
        isDefault: boolean;
    })[]>;
    getOnboardingTasks(tenantId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        isActive: boolean;
        type: import("@prisma/client").$Enums.TaskType;
        description: string | null;
        isRequired: boolean;
        order: number;
        config: string;
    }[]>;
}
