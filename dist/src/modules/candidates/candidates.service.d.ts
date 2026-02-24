import { PrismaService } from '../../config/config.module';
import { AuditLogger } from '../../modules/audit-logs/audit-logger.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { OnboardingStateMachine } from '../onboarding/onboarding-state-machine.service';
import { EmailService } from '../email/email.service';
export declare class CandidatesService {
    private prisma;
    private auditLogger;
    private stateMachine;
    private emailService;
    constructor(prisma: PrismaService, auditLogger: AuditLogger, stateMachine: OnboardingStateMachine, emailService: EmailService);
    create(tenantId: string, dto: CreateCandidateDto, userId?: string): Promise<{
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
    }>;
    findAll(tenantId: string, filters?: {
        state?: string;
        search?: string;
    }): Promise<({
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
        onboarding: {
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
        } | null;
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
    findOne(tenantId: string, candidateId: string): Promise<{
        documents: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            expiresAt: Date | null;
            type: string;
            candidateId: string;
            fileUrl: string;
            fileSize: number | null;
            mimeType: string | null;
            uploadedAt: Date;
        }[];
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
    }>;
    assignPacket(tenantId: string, candidateId: string, packetId: string, userId?: string): Promise<{
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
    }>;
    private generateSecureToken;
}
