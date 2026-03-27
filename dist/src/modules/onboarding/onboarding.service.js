"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = exports.OnboardingStep = void 0;
const common_1 = require("@nestjs/common");
const config_module_1 = require("../../config/config.module");
const onboarding_state_machine_service_1 = require("./onboarding-state-machine.service");
const audit_logger_service_1 = require("../../modules/audit-logs/audit-logger.service");
const email_service_1 = require("../email/email.service");
var OnboardingStep;
(function (OnboardingStep) {
    OnboardingStep["PERSONAL_INFO"] = "personal_info";
    OnboardingStep["OFFER_LETTER"] = "offer_letter";
    OnboardingStep["BACKGROUND_CHECK"] = "background_check";
    OnboardingStep["DOCUMENT_UPLOAD"] = "document_upload";
    OnboardingStep["TRAINING_VIDEO"] = "training_video";
    OnboardingStep["SIGNATURE"] = "signature";
    OnboardingStep["COMPLETE"] = "complete";
})(OnboardingStep || (exports.OnboardingStep = OnboardingStep = {}));
let OnboardingService = OnboardingService_1 = class OnboardingService {
    prisma;
    stateMachine;
    auditLogger;
    emailService;
    logger = new common_1.Logger(OnboardingService_1.name);
    constructor(prisma, stateMachine, auditLogger, emailService) {
        this.prisma = prisma;
        this.stateMachine = stateMachine;
        this.auditLogger = auditLogger;
        this.emailService = emailService;
    }
    async getOnboardingByToken(secureToken) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { secureToken },
            include: {
                candidate: true,
                packet: true,
                taskStatuses: {
                    include: { task: true },
                    orderBy: { task: { order: 'asc' } },
                },
            },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.tokenExpiresAt < new Date()) {
            throw new common_1.ForbiddenException('Onboarding link has expired');
        }
        const progress = await this.stateMachine.calculateProgress(onboarding.id);
        return {
            ...onboarding,
            progressPercent: progress,
        };
    }
    async getTask(onboardingId, taskId, tenantId) {
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: {
                onboardingId,
                taskId,
                onboarding: { tenantId },
            },
            include: { task: true, onboarding: { include: { candidate: true } } },
        });
        if (!taskStatus) {
            throw new common_1.NotFoundException('Task status not found');
        }
        return taskStatus;
    }
    async saveTaskDraft(onboardingId, taskId, tenantId, submissionData) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.currentState === 'employee_active') {
            throw new common_1.BadRequestException('Onboarding already completed');
        }
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId } },
            create: {
                onboardingId,
                taskId,
                status: 'draft',
                submissionData: JSON.stringify(submissionData),
            },
            update: {
                submissionData: JSON.stringify(submissionData),
            },
        });
        return taskStatus;
    }
    async submitTask(onboardingId, taskId, tenantId, submissionData) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.currentState === 'employee_active') {
            throw new common_1.BadRequestException('Onboarding already completed');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { id: taskId, tenantId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId } },
            create: {
                onboardingId,
                taskId,
                status: 'submitted',
                submissionData: JSON.stringify(submissionData),
                submittedAt: new Date(),
            },
            update: {
                status: 'submitted',
                submissionData: JSON.stringify(submissionData),
                submittedAt: new Date(),
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'TASK_SUBMITTED',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: taskStatus.id,
            metadata: { taskId, taskName: task.name, taskType: task.type },
        });
        await this.checkAndAdvanceState(onboardingId, tenantId);
        return taskStatus;
    }
    async approveTask(onboardingId, taskId, tenantId, userId, comment) {
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: {
                onboardingId,
                taskId,
                onboarding: { tenantId },
            },
            include: { task: true },
        });
        if (!taskStatus) {
            throw new common_1.NotFoundException('Task status not found');
        }
        if (taskStatus.status !== 'submitted') {
            throw new common_1.BadRequestException('Task must be in submitted status to approve');
        }
        const updated = await this.prisma.employeeOnboardingTaskStatus.update({
            where: { id: taskStatus.id },
            data: {
                status: 'approved',
                reviewedAt: new Date(),
                reviewedByUserId: userId,
                reviewComment: comment,
            },
        });
        await this.auditLogger.log({
            tenantId,
            userId,
            action: 'TASK_APPROVED',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: taskStatus.id,
            metadata: { taskId, taskName: taskStatus.task.name, comment },
        });
        await this.checkAndAdvanceState(onboardingId, tenantId);
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { candidate: true },
        });
        if (onboarding?.candidate) {
            await this.emailService.sendTaskApprovalNotification(onboarding.candidate.email, taskStatus.task.name);
        }
        return updated;
    }
    async rejectTask(onboardingId, taskId, tenantId, userId, comment) {
        if (!comment) {
            throw new common_1.BadRequestException('Rejection comment is required');
        }
        const taskStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: {
                onboardingId,
                taskId,
                onboarding: { tenantId },
            },
            include: { task: true },
        });
        if (!taskStatus) {
            throw new common_1.NotFoundException('Task status not found');
        }
        const updated = await this.prisma.employeeOnboardingTaskStatus.update({
            where: { id: taskStatus.id },
            data: {
                status: 'rejected',
                reviewedAt: new Date(),
                reviewedByUserId: userId,
                reviewComment: comment,
            },
        });
        await this.auditLogger.log({
            tenantId,
            userId,
            action: 'TASK_REJECTED',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: taskStatus.id,
            metadata: { taskId, taskName: taskStatus.task.name, comment },
        });
        await this.transitionToInProgress(onboardingId, tenantId);
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { candidate: true },
        });
        if (onboarding?.candidate) {
            await this.emailService.sendTaskRejectionNotification(onboarding.candidate.email, taskStatus.task.name, comment);
        }
        return updated;
    }
    async checkAndAdvanceState(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
            include: { taskStatuses: true },
        });
        if (!onboarding)
            return;
        const allSubmitted = onboarding.taskStatuses.every((ts) => ts.status === 'submitted' || ts.status === 'approved');
        if (allSubmitted && onboarding.currentState === 'in_progress') {
            await this.stateMachine.transitionToState(onboardingId, 'pending_hr_review');
        }
    }
    async transitionToInProgress(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { id: onboardingId },
        });
        if (!onboarding)
            return;
        if (onboarding.currentState === 'in_progress' || onboarding.currentState === 'pending_hr_review') {
            await this.stateMachine.transitionToState(onboardingId, 'in_progress');
        }
    }
    async getProgress(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: {
                taskStatuses: { include: { task: true } },
            },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const progress = await this.stateMachine.calculateProgress(onboardingId);
        const taskBreakdown = onboarding.taskStatuses.map((ts) => ({
            taskId: ts.taskId,
            taskName: ts.task.name,
            taskType: ts.task.type,
            status: ts.status,
            isRequired: ts.task.isRequired,
        }));
        return {
            onboardingId,
            currentState: onboarding.currentState,
            progressPercent: progress,
            tasks: taskBreakdown,
        };
    }
    async getOnboardingSteps(secureToken) {
        const onboarding = await this.prisma.employeeOnboarding.findUnique({
            where: { secureToken },
            include: {
                candidate: true,
                taskStatuses: { include: { task: true } },
            },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (onboarding.tokenExpiresAt < new Date()) {
            throw new common_1.ForbiddenException('Onboarding link has expired');
        }
        const steps = [
            { step: OnboardingStep.PERSONAL_INFO, title: 'Personal Information', order: 1 },
            { step: OnboardingStep.OFFER_LETTER, title: 'Offer Letter', order: 2 },
            { step: OnboardingStep.DOCUMENT_UPLOAD, title: 'Upload Documents', order: 3 },
            { step: OnboardingStep.TRAINING_VIDEO, title: 'Training Video', order: 4 },
            { step: OnboardingStep.SIGNATURE, title: 'Signature Confirmation', order: 5 },
            { step: OnboardingStep.COMPLETE, title: 'Complete', order: 6 },
        ];
        const stepStatuses = await this.calculateStepStatuses(onboarding);
        return {
            onboardingId: onboarding.id,
            candidate: {
                firstName: onboarding.candidate.firstName,
                lastName: onboarding.candidate.lastName,
                email: onboarding.candidate.email,
            },
            currentStep: stepStatuses.currentStep,
            steps: steps.map((s) => ({
                ...s,
                status: stepStatuses[s.step] || 'pending',
            })),
            progressPercent: this.calculateStepProgress(stepStatuses),
        };
    }
    async calculateStepStatuses(onboarding) {
        const statuses = {};
        let currentStep = OnboardingStep.PERSONAL_INFO;
        const personalInfoTask = onboarding.taskStatuses.find((ts) => ts.task?.type === 'personal_info');
        const documentTask = onboarding.taskStatuses.find((ts) => ts.task?.type === 'document_upload');
        const trainingTask = onboarding.taskStatuses.find((ts) => ts.task?.type === 'training_acknowledgment');
        const signatureTask = onboarding.taskStatuses.find((ts) => ts.task?.type === 'e_signature');
        if (personalInfoTask?.status === 'approved') {
            statuses[OnboardingStep.PERSONAL_INFO] = 'completed';
            currentStep = OnboardingStep.OFFER_LETTER;
        }
        else if (personalInfoTask?.status === 'submitted') {
            statuses[OnboardingStep.PERSONAL_INFO] = 'submitted';
            currentStep = OnboardingStep.PERSONAL_INFO;
        }
        else if (personalInfoTask?.status === 'draft') {
            statuses[OnboardingStep.PERSONAL_INFO] = 'in_progress';
            currentStep = OnboardingStep.PERSONAL_INFO;
        }
        else {
            statuses[OnboardingStep.PERSONAL_INFO] = 'pending';
        }
        const offerEnvelope = await this.prisma.eSignEnvelope.findFirst({
            where: { candidateId: onboarding.candidateId },
            orderBy: { createdAt: 'desc' },
        });
        if (offerEnvelope?.status === 'signed') {
            statuses[OnboardingStep.OFFER_LETTER] = 'completed';
            currentStep = OnboardingStep.DOCUMENT_UPLOAD;
        }
        else if (offerEnvelope?.status === 'sent') {
            statuses[OnboardingStep.OFFER_LETTER] = 'pending_signature';
            currentStep = OnboardingStep.OFFER_LETTER;
        }
        else if (offerEnvelope) {
            statuses[OnboardingStep.OFFER_LETTER] = 'in_progress';
            currentStep = OnboardingStep.OFFER_LETTER;
        }
        else {
            statuses[OnboardingStep.OFFER_LETTER] = 'pending';
        }
        if (documentTask?.status === 'approved') {
            statuses[OnboardingStep.DOCUMENT_UPLOAD] = 'completed';
            currentStep = OnboardingStep.TRAINING_VIDEO;
        }
        else if (documentTask?.status === 'submitted') {
            statuses[OnboardingStep.DOCUMENT_UPLOAD] = 'submitted';
            currentStep = OnboardingStep.DOCUMENT_UPLOAD;
        }
        else if (documentTask?.status === 'draft') {
            statuses[OnboardingStep.DOCUMENT_UPLOAD] = 'in_progress';
            currentStep = OnboardingStep.DOCUMENT_UPLOAD;
        }
        else {
            statuses[OnboardingStep.DOCUMENT_UPLOAD] = 'pending';
        }
        if (trainingTask?.status === 'approved') {
            statuses[OnboardingStep.TRAINING_VIDEO] = 'completed';
            currentStep = OnboardingStep.SIGNATURE;
        }
        else if (trainingTask?.submissionData) {
            const data = JSON.parse(trainingTask.submissionData);
            if (data.watchProgress >= 90 && data.acknowledged) {
                statuses[OnboardingStep.TRAINING_VIDEO] = 'completed';
                currentStep = OnboardingStep.SIGNATURE;
            }
            else if (data.watchProgress >= 90) {
                statuses[OnboardingStep.TRAINING_VIDEO] = 'ready_to_sign';
                currentStep = OnboardingStep.TRAINING_VIDEO;
            }
            else if (data.watchProgress > 0) {
                statuses[OnboardingStep.TRAINING_VIDEO] = 'in_progress';
                currentStep = OnboardingStep.TRAINING_VIDEO;
            }
            else {
                statuses[OnboardingStep.TRAINING_VIDEO] = 'pending';
            }
        }
        else {
            statuses[OnboardingStep.TRAINING_VIDEO] = 'pending';
        }
        if (signatureTask?.status === 'approved') {
            statuses[OnboardingStep.SIGNATURE] = 'completed';
            currentStep = OnboardingStep.COMPLETE;
        }
        else if (signatureTask?.submissionData) {
            statuses[OnboardingStep.SIGNATURE] = 'submitted';
            currentStep = OnboardingStep.SIGNATURE;
        }
        else {
            statuses[OnboardingStep.SIGNATURE] = 'pending';
        }
        if (onboarding.currentState === 'employee_active') {
            statuses[OnboardingStep.COMPLETE] = 'completed';
            currentStep = OnboardingStep.COMPLETE;
        }
        else {
            statuses[OnboardingStep.COMPLETE] = 'pending';
        }
        return { ...statuses, currentStep };
    }
    calculateStepProgress(stepStatuses) {
        const completedSteps = Object.values(stepStatuses).filter((s) => s === 'completed').length;
        return Math.round((completedSteps / 6) * 100);
    }
    async submitPersonalInfo(onboardingId, tenantId, data) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: { candidate: true },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { tenantId, type: 'personal_info' },
        });
        if (!task) {
            throw new common_1.NotFoundException('Personal info task not found');
        }
        await this.prisma.candidate.update({
            where: { id: onboarding.candidateId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
            },
        });
        await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId: task.id } },
            create: {
                onboardingId,
                taskId: task.id,
                status: 'submitted',
                submissionData: JSON.stringify(data),
                submittedAt: new Date(),
            },
            update: {
                status: 'submitted',
                submissionData: JSON.stringify(data),
                submittedAt: new Date(),
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'SUBMIT_PERSONAL_INFO',
            entityType: 'EmployeeOnboarding',
            entityId: onboardingId,
            metadata: data,
        });
        return { success: true, message: 'Personal information submitted' };
    }
    async createOfferLetterEnvelope(onboardingId, tenantId, data) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: { candidate: true },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const existingEnvelope = await this.prisma.eSignEnvelope.findFirst({
            where: { candidateId: onboarding.candidateId },
            orderBy: { createdAt: 'desc' },
        });
        if (existingEnvelope?.status === 'signed') {
            throw new common_1.BadRequestException('Offer letter already signed');
        }
        const envelope = await this.prisma.eSignEnvelope.create({
            data: {
                candidateId: onboarding.candidateId,
                tenantId,
                provider: 'internal',
                status: data.action === 'view' ? 'pending' : 'sent',
                documentUrl: `${process.env.APP_URL}/documents/offer-letter/${onboarding.candidateId}`,
                signerName: `${onboarding.candidate.firstName} ${onboarding.candidate.lastName}`,
                signerEmail: onboarding.candidate.email,
                sentAt: data.action !== 'view' ? new Date() : null,
                payloadJson: JSON.stringify({ action: data.action }),
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'OFFER_LETTER_ACTION',
            entityType: 'ESignEnvelope',
            entityId: envelope.id,
            metadata: { action: data.action },
        });
        return envelope;
    }
    async signOfferLetter(onboardingId, tenantId, signatureData) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: { candidate: true },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const envelope = await this.prisma.eSignEnvelope.findFirst({
            where: { candidateId: onboarding.candidateId },
            orderBy: { createdAt: 'desc' },
        });
        if (!envelope) {
            throw new common_1.NotFoundException('Offer letter not found');
        }
        if (envelope.status === 'signed') {
            throw new common_1.BadRequestException('Offer letter already signed');
        }
        if (!signatureData.signatureType ||
            (signatureData.signatureType === 'typed' && !signatureData.typedName) ||
            (signatureData.signatureType === 'handwritten' && !signatureData.signatureImageUrl)) {
            throw new common_1.BadRequestException('Valid signature is required');
        }
        const signedAt = new Date();
        const payloadJson = JSON.stringify({
            signatureType: signatureData.signatureType,
            typedName: signatureData.typedName,
            signatureImageUrl: signatureData.signatureImageUrl,
            signedAt: signedAt.toISOString(),
        });
        const updated = await this.prisma.eSignEnvelope.update({
            where: { id: envelope.id },
            data: {
                status: 'signed',
                signedAt,
                signatureHash: this.generateSignatureHash(signatureData),
                payloadJson,
                signedDocumentUrl: `${process.env.APP_URL}/documents/signed/${envelope.id}`,
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'SIGN_OFFER_LETTER',
            entityType: 'ESignEnvelope',
            entityId: envelope.id,
            metadata: { signatureType: signatureData.signatureType },
        });
        await this.emailService.sendSignedOfferLetter(onboarding.candidate.email, onboarding.candidate.firstName, updated.signedDocumentUrl || '');
        await this.checkAndAdvanceState(onboardingId, tenantId);
        return { success: true, message: 'Offer letter signed successfully' };
    }
    generateSignatureHash(data) {
        const crypto = require('crypto');
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }
    async uploadDocuments(onboardingId, tenantId, documents) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { tenantId, type: 'document_upload' },
        });
        const createdDocs = await Promise.all(documents.map((doc) => this.prisma.document.create({
            data: {
                candidateId: onboarding.candidateId,
                tenantId,
                name: doc.name,
                type: doc.type,
                fileUrl: doc.fileUrl,
                fileSize: doc.fileSize,
                mimeType: doc.mimeType,
            },
        })));
        if (task) {
            await this.prisma.employeeOnboardingTaskStatus.upsert({
                where: { onboardingId_taskId: { onboardingId, taskId: task.id } },
                create: {
                    onboardingId,
                    taskId: task.id,
                    status: 'submitted',
                    submissionData: JSON.stringify({ documents: createdDocs.map((d) => d.id) }),
                    submittedAt: new Date(),
                },
                update: {
                    status: 'submitted',
                    submissionData: JSON.stringify({ documents: createdDocs.map((d) => d.id) }),
                    submittedAt: new Date(),
                },
            });
        }
        await this.auditLogger.log({
            tenantId,
            action: 'UPLOAD_DOCUMENTS',
            entityType: 'EmployeeOnboarding',
            entityId: onboardingId,
            metadata: { documentCount: documents.length },
        });
        return { success: true, documents: createdDocs };
    }
    async updateTrainingProgress(onboardingId, tenantId, watchProgress) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { tenantId, type: 'training_acknowledgment' },
        });
        if (!task) {
            throw new common_1.NotFoundException('Training task not found');
        }
        const existingStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: { onboardingId, taskId: task.id },
        });
        const existingData = existingStatus?.submissionData
            ? JSON.parse(existingStatus.submissionData)
            : {};
        const updatedData = {
            ...existingData,
            watchProgress: Math.max(existingData.watchProgress || 0, watchProgress),
            lastUpdated: new Date().toISOString(),
        };
        await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId: task.id } },
            create: {
                onboardingId,
                taskId: task.id,
                status: 'draft',
                submissionData: JSON.stringify(updatedData),
            },
            update: {
                submissionData: JSON.stringify(updatedData),
            },
        });
        return {
            success: true,
            watchProgress: updatedData.watchProgress,
            canSign: updatedData.watchProgress >= 90,
        };
    }
    async acknowledgeTraining(onboardingId, tenantId, signatureHash) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { tenantId, type: 'training_acknowledgment' },
        });
        if (!task) {
            throw new common_1.NotFoundException('Training task not found');
        }
        const existingStatus = await this.prisma.employeeOnboardingTaskStatus.findFirst({
            where: { onboardingId, taskId: task.id },
        });
        if (!existingStatus?.submissionData) {
            throw new common_1.BadRequestException('Training not started');
        }
        const data = JSON.parse(existingStatus.submissionData);
        if (data.watchProgress < 90) {
            throw new common_1.BadRequestException('Must watch at least 90% of video before acknowledging');
        }
        const updated = await this.prisma.employeeOnboardingTaskStatus.update({
            where: { id: existingStatus.id },
            data: {
                status: 'submitted',
                submittedAt: new Date(),
                submissionData: JSON.stringify({
                    ...data,
                    acknowledged: true,
                    signatureHash,
                    acknowledgedAt: new Date().toISOString(),
                }),
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'ACKNOWLEDGE_TRAINING',
            entityType: 'EmployeeOnboardingTaskStatus',
            entityId: updated.id,
        });
        await this.checkAndAdvanceState(onboardingId, tenantId);
        return { success: true, message: 'Training acknowledged successfully' };
    }
    async submitFinalSignature(onboardingId, tenantId, signatureData) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: { candidate: true },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        if (!signatureData.signatureType ||
            (signatureData.signatureType === 'typed' && !signatureData.typedName) ||
            (signatureData.signatureType === 'handwritten' && !signatureData.signatureImageUrl)) {
            throw new common_1.BadRequestException('Valid signature is required');
        }
        const task = await this.prisma.onboardingTask.findFirst({
            where: { tenantId, type: 'e_signature' },
        });
        if (!task) {
            throw new common_1.NotFoundException('Signature task not found');
        }
        const signedAt = new Date();
        const signatureHash = this.generateSignatureHash(signatureData);
        await this.prisma.employeeOnboardingTaskStatus.upsert({
            where: { onboardingId_taskId: { onboardingId, taskId: task.id } },
            create: {
                onboardingId,
                taskId: task.id,
                status: 'submitted',
                submittedAt: signedAt,
                submissionData: JSON.stringify({
                    signatureType: signatureData.signatureType,
                    typedName: signatureData.typedName,
                    signatureImageUrl: signatureData.signatureImageUrl,
                    signedAt: signedAt.toISOString(),
                    signatureHash,
                }),
            },
            update: {
                status: 'submitted',
                submittedAt: signedAt,
                submissionData: JSON.stringify({
                    signatureType: signatureData.signatureType,
                    typedName: signatureData.typedName,
                    signatureImageUrl: signatureData.signatureImageUrl,
                    signedAt: signedAt.toISOString(),
                    signatureHash,
                }),
            },
        });
        await this.auditLogger.log({
            tenantId,
            action: 'SUBMIT_FINAL_SIGNATURE',
            entityType: 'EmployeeOnboarding',
            entityId: onboardingId,
            metadata: { signatureType: signatureData.signatureType },
        });
        await this.checkAndAdvanceState(onboardingId, tenantId);
        return { success: true, message: 'Signature submitted successfully' };
    }
    async completeOnboarding(onboardingId, tenantId) {
        const onboarding = await this.prisma.employeeOnboarding.findFirst({
            where: { id: onboardingId, tenantId },
            include: { candidate: true, taskStatuses: { include: { task: true } } },
        });
        if (!onboarding) {
            throw new common_1.NotFoundException('Onboarding not found');
        }
        const allComplete = onboarding.taskStatuses.every((ts) => ts.status === 'submitted' || ts.status === 'approved');
        if (!allComplete) {
            throw new common_1.BadRequestException('All tasks must be completed before finishing onboarding');
        }
        await this.stateMachine.transitionToState(onboardingId, 'employee_active');
        await this.prisma.employeeOnboarding.update({
            where: { id: onboardingId },
            data: {
                currentState: 'employee_active',
                completedAt: new Date(),
                activatedAt: new Date(),
                progressPercent: 100,
            },
        });
        await this.emailService.sendActivationNotification(onboarding.candidate.email, onboarding.candidate.firstName);
        await this.auditLogger.log({
            tenantId,
            action: 'COMPLETE_ONBOARDING',
            entityType: 'EmployeeOnboarding',
            entityId: onboardingId,
        });
        return { success: true, message: 'Onboarding completed successfully' };
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = OnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_module_1.PrismaService,
        onboarding_state_machine_service_1.OnboardingStateMachine,
        audit_logger_service_1.AuditLogger,
        email_service_1.EmailService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map