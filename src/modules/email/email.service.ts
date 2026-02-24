import { Injectable, Logger } from '@nestjs/common';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  tenantId?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendOnboardingInvitation(candidate: any, secureToken: string) {
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

  async sendTaskRejectionNotification(email: string, taskName: string, reason: string) {
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

  async sendTaskApprovalNotification(email: string, taskName: string) {
    await this.send({
      to: email,
      subject: `${taskName} - Approved`,
      body: `
        <h1>Task Approved</h1>
        <p>Your submission for "${taskName}" has been approved!</p>
      `,
    });
  }

  async sendActivationNotification(email: string, firstName: string) {
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

  private async send(options: EmailOptions): Promise<void> {
    const provider = process.env.EMAIL_PROVIDER || 'console';
    
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
    
    if (provider === 'console') {
      this.logger.debug(`Email content: ${options.body}`);
      return;
    }

    if (provider === 'ses') {
      await this.sendViaSES(options);
    } else if (provider === 'smtp') {
      await this.sendViaSMTP(options);
    }
  }

  private async sendViaSES(options: EmailOptions): Promise<void> {
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

  private async sendViaSMTP(options: EmailOptions): Promise<void> {
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
}
