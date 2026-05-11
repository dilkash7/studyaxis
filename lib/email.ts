// Email Utility Skeleton
// You can install 'nodemailer' or use Resend's REST API here.

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  // TODO: Implement actual SMTP sending logic once credentials are provided
  console.log('--- MOCK EMAIL DISPATCH ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('Email successfully queued (Mock)');
  return true;
};
