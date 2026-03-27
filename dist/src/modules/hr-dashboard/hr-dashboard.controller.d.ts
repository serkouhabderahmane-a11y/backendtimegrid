import { HrDashboardService } from './hr-dashboard.service';
export declare class HrDashboardController {
    private hrDashboardService;
    constructor(hrDashboardService: HrDashboardService);
    getStats(tenantId: string): Promise<{
        totalCandidates: number;
        activeEmployees: number;
        pendingApprovals: number;
        candidatesByState: Record<string, number>;
    }>;
    getCandidatesByState(tenantId: string, state: string): Promise<({
        location: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
            address: string | null;
        } | null;
        department: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            isActive: boolean;
        } | null;
        onboarding: ({
            taskStatuses: ({
                task: {
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
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                onboardingId: string;
                taskId: string;
                status: import("@prisma/client").$Enums.TaskStatus;
                submissionData: string | null;
                submittedAt: Date | null;
                reviewedAt: Date | null;
                reviewComment: string | null;
                reviewedByUserId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            candidateId: string;
            secureToken: string;
            packetId: string;
            tokenExpiresAt: Date;
            progressPercent: number;
            currentState: import("@prisma/client").$Enums.OnboardingState;
            completedAt: Date | null;
            activatedAt: Date | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        email: string;
        firstName: string;
        lastName: string;
        state: import("@prisma/client").$Enums.OnboardingState;
        phone: string | null;
        position: string;
        locationId: string | null;
        departmentId: string | null;
        employmentType: import("@prisma/client").$Enums.EmploymentType;
        startDate: Date;
        rejectedReason: string | null;
    })[]>;
    getApprovalQueue(tenantId: string): Promise<({
        onboarding: {
            candidate: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                email: string;
                firstName: string;
                lastName: string;
                state: import("@prisma/client").$Enums.OnboardingState;
                phone: string | null;
                position: string;
                locationId: string | null;
                departmentId: string | null;
                employmentType: import("@prisma/client").$Enums.EmploymentType;
                startDate: Date;
                rejectedReason: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            candidateId: string;
            secureToken: string;
            packetId: string;
            tokenExpiresAt: Date;
            progressPercent: number;
            currentState: import("@prisma/client").$Enums.OnboardingState;
            completedAt: Date | null;
            activatedAt: Date | null;
        };
        task: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        onboardingId: string;
        taskId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        submissionData: string | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        reviewComment: string | null;
        reviewedByUserId: string | null;
    })[]>;
    getRejectedTasks(tenantId: string): Promise<({
        onboarding: {
            candidate: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                email: string;
                firstName: string;
                lastName: string;
                state: import("@prisma/client").$Enums.OnboardingState;
                phone: string | null;
                position: string;
                locationId: string | null;
                departmentId: string | null;
                employmentType: import("@prisma/client").$Enums.EmploymentType;
                startDate: Date;
                rejectedReason: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            candidateId: string;
            secureToken: string;
            packetId: string;
            tokenExpiresAt: Date;
            progressPercent: number;
            currentState: import("@prisma/client").$Enums.OnboardingState;
            completedAt: Date | null;
            activatedAt: Date | null;
        };
        task: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        onboardingId: string;
        taskId: string;
        status: import("@prisma/client").$Enums.TaskStatus;
        submissionData: string | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        reviewComment: string | null;
        reviewedByUserId: string | null;
    })[]>;
    getExpiredDocuments(tenantId: string): Promise<({
        candidate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string;
            firstName: string;
            lastName: string;
            state: import("@prisma/client").$Enums.OnboardingState;
            phone: string | null;
            position: string;
            locationId: string | null;
            departmentId: string | null;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            startDate: Date;
            rejectedReason: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: string;
        expiresAt: Date | null;
        candidateId: string | null;
        employeeId: string | null;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedAt: Date;
    })[]>;
    getExpiringDocuments(tenantId: string, days?: string): Promise<({
        candidate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            email: string;
            firstName: string;
            lastName: string;
            state: import("@prisma/client").$Enums.OnboardingState;
            phone: string | null;
            position: string;
            locationId: string | null;
            departmentId: string | null;
            employmentType: import("@prisma/client").$Enums.EmploymentType;
            startDate: Date;
            rejectedReason: string | null;
        } | null;
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        type: string;
        expiresAt: Date | null;
        candidateId: string | null;
        employeeId: string | null;
        fileUrl: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedAt: Date;
    })[]>;
}
