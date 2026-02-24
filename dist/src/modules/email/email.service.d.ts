export declare class EmailService {
    private readonly logger;
    sendOnboardingInvitation(candidate: any, secureToken: string): Promise<void>;
    sendTaskRejectionNotification(email: string, taskName: string, reason: string): Promise<void>;
    sendTaskApprovalNotification(email: string, taskName: string): Promise<void>;
    sendActivationNotification(email: string, firstName: string): Promise<void>;
    private send;
    private sendViaSES;
    private sendViaSMTP;
}
