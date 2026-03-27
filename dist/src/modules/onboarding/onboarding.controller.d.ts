import { OnboardingService } from './onboarding.service';
export declare class OnboardingController {
    private onboardingService;
    constructor(onboardingService: OnboardingService);
    getByToken(secureToken: string): Promise<{
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
    getOnboardingSteps(secureToken: string): Promise<{
        onboardingId: string;
        candidate: {
            firstName: string;
            lastName: string;
            email: string;
        };
        currentStep: import("./onboarding.service").OnboardingStep;
        steps: {
            status: any;
            step: import("./onboarding.service").OnboardingStep;
            title: string;
            order: number;
        }[];
        progressPercent: number;
    }>;
    submitPersonalInfo(onboardingId: string, tenantId: string, data: {
        firstName: string;
        lastName: string;
        phone: string;
        address: string;
        emergencyContact: string;
        emergencyPhone: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    createOfferLetterEnvelope(onboardingId: string, tenantId: string, data: {
        action: 'view' | 'accept' | 'reject';
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        ipAddress: string | null;
        candidateId: string;
        status: string;
        taskStatusId: string | null;
        envelopeId: string | null;
        provider: string | null;
        documentUrl: string | null;
        signedDocumentUrl: string | null;
        signatureHash: string | null;
        signedAt: Date | null;
        signerName: string | null;
        signerEmail: string | null;
        payloadJson: string | null;
        sentAt: Date | null;
    }>;
    signOfferLetter(onboardingId: string, tenantId: string, data: {
        signatureType: 'typed' | 'handwritten';
        typedName?: string;
        signatureImageUrl?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    uploadDocuments(onboardingId: string, tenantId: string, documents: Array<{
        name: string;
        type: string;
        fileUrl: string;
        fileSize?: number;
        mimeType?: string;
    }>): Promise<{
        success: boolean;
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
    }>;
    updateTrainingProgress(onboardingId: string, tenantId: string, watchProgress: number): Promise<{
        success: boolean;
        watchProgress: any;
        canSign: boolean;
    }>;
    acknowledgeTraining(onboardingId: string, tenantId: string, signatureHash: string): Promise<{
        success: boolean;
        message: string;
    }>;
    submitFinalSignature(onboardingId: string, tenantId: string, data: {
        signatureType: 'typed' | 'handwritten';
        typedName?: string;
        signatureImageUrl?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    completeOnboarding(onboardingId: string, tenantId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    saveDraft(onboardingId: string, taskId: string, tenantId: string, submissionData: Record<string, any>): Promise<{
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
    approveTask(onboardingId: string, taskId: string, tenantId: string, req: any, comment?: string): Promise<{
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
    rejectTask(onboardingId: string, taskId: string, tenantId: string, req: any, comment: string): Promise<{
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
