"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    async sendOnboardingInvitation(candidate, secureToken) {
        const onboardingUrl = `${process.env.APP_URL}/onboarding/${secureToken}`;
        await this.send({
            to: candidate.email,
            subject: 'Welcome! Complete Your Onboarding',
            body: `
        <h1>Welcome ${candidate.firstName}!</h1>
        <p>We're excited to have you join us. Please complete your onboarding tasks by clicking the link below:</p>
        <p><a href="${onboardingUrl}">Complete Onboarding</a></p>
        <p>This link will expire in 30 days.</p>
      `,
        });
    }
    async sendTaskRejectionNotification(email, taskName, reason) {
        await this.send({
            to: email,
            subject: `Action Required: ${taskName} needs revision`,
            body: `
        <h1>Task Needs Revision</h1>
        <p>Your submission for "${taskName}" has been rejected.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review and resubmit your task.</p>
      `,
        });
    }
    async sendTaskApprovalNotification(email, taskName) {
        await this.send({
            to: email,
            subject: `${taskName} - Approved`,
            body: `
        <h1>Task Approved</h1>
        <p>Your submission for "${taskName}" has been approved!</p>
      `,
        });
    }
    async sendActivationNotification(email, firstName) {
        await this.send({
            to: email,
            subject: 'Welcome to the Team!',
            body: `
        <h1>Congratulations ${firstName}!</h1>
        <p>Your onboarding is complete and you're now an active employee.</p>
        <p>You can now clock in and access the system.</p>
      `,
        });
    }
    async send(options) {
        const provider = process.env.EMAIL_PROVIDER || 'console';
        this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
        if (provider === 'console') {
            this.logger.debug(`Email content: ${options.body}`);
            return;
        }
        if (provider === 'ses') {
            await this.sendViaSES(options);
        }
        else if (provider === 'smtp') {
            await this.sendViaSMTP(options);
        }
    }
    async sendViaSES(options) {
        const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
        const client = new SESClient({ region: process.env.AWS_REGION });
        const command = new SendEmailCommand({
            Source: process.env.EMAIL_FROM,
            Destination: { ToAddresses: [options.to] },
            Message: {
                Subject: { Data: options.subject },
                Body: { Html: { Data: options.body } },
            },
        });
        await client.send(command);
    }
    async sendViaSMTP(options) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.body,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)()
], EmailService);
//# sourceMappingURL=email.service.js.map