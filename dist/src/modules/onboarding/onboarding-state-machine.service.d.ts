import { PrismaService } from '../../config/config.module';
import { AuditLogger } from '../../modules/audit-logs/audit-logger.service';
export declare class OnboardingStateMachine {
    private prisma;
    private auditLogger;
    private readonly logger;
    constructor(prisma: PrismaService, auditLogger: AuditLogger);
    transitionToState(onboardingId: string, targetState: string, userId?: string, metadata?: Record<string, any>): Promise<any>;
    private activateEmployee;
    private generateTempPassword;
    canTransitionTo(onboardingId: string, targetState: string): Promise<boolean>;
    getNextState(currentState: string): Promise<string | null>;
    calculateProgress(onboardingId: string): Promise<number>;
    areAllRequiredTasksApproved(onboardingId: string): Promise<boolean>;
}
