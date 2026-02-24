import { PrismaService } from '../../config/config.module';
import { OnboardingStateMachine } from './onboarding-state-machine.service';
import { AuditLogger } from '../../modules/audit-logs/audit-logger.service';
import { EmailService } from '../email/email.service';
export declare class OnboardingService {
    private prisma;
    private stateMachine;
    private auditLogger;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, stateMachine: OnboardingStateMachine, auditLogger: AuditLogger, emailService: EmailService);
    getOnboardingByToken(secureToken: string): Promise<{
        progressPercent: number;
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
        packet: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tasks: string;
            tenantId: string;
            isActive: boolean;
            description: string | null;
            isDefault: boolean;
        };
        taskStatuses: ({
            task: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                isActive: boolean;
                description: string | null;
                type: import("@prisma/client").$Enums.TaskType;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        candidateId: string;
        secureToken: string;
        packetId: string;
        tokenExpiresAt: Date;
        currentState: import("@prisma/client").$Enums.OnboardingState;
        completedAt: Date | null;
        activatedAt: Date | null;
    }>;
    getTask(onboardingId: string, taskId: string, tenantId: string): Promise<{
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
            description: string | null;
            type: import("@prisma/client").$Enums.TaskType;
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
    }>;
    saveTaskDraft(onboardingId: string, taskId: string, tenantId: string, submissionData: Record<string, any>): Promise<{
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
    }>;
    submitTask(onboardingId: string, taskId: string, tenantId: string, submissionData: Record<string, any>): Promise<{
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
    }>;
    approveTask(onboardingId: string, taskId: string, tenantId: string, userId: string, comment?: string): Promise<{
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
    }>;
    rejectTask(onboardingId: string, taskId: string, tenantId: string, userId: string, comment: string): Promise<{
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
    }>;
    private checkAndAdvanceState;
    private transitionToInProgress;
    getProgress(onboardingId: string, tenantId: string): Promise<{
        onboardingId: string;
        currentState: import("@prisma/client").$Enums.OnboardingState;
        progressPercent: number;
        tasks: {
            taskId: string;
            taskName: string;
            taskType: import("@prisma/client").$Enums.TaskType;
            status: import("@prisma/client").$Enums.TaskStatus;
            isRequired: boolean;
        }[];
    }>;
}
