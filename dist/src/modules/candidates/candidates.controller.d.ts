import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
export declare class CandidatesController {
    private candidatesService;
    constructor(candidatesService: CandidatesService);
    create(tenantId: string, dto: CreateCandidateDto, req: any): Promise<{
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
    findAll(tenantId: string, state?: string, search?: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<{
        documents: {
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
    }>;
    assignPacket(tenantId: string, id: string, packetId: string, req: any): Promise<{
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
}
