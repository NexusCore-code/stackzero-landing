import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a StackZero email with a PDF report attachment
 */
export async function sendStackZeroEmail({ name, email, reportType, pdfBuffer }) {
  try {
    const htmlPath = path.join(process.cwd(), 'report-email-preview.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    const safeName = name || 'there';
    html = html.replace(/Hi .*?,/, `Hi ${safeName},`);

    const subject = reportType === 'free'
      ? 'Your Free StackZero Report is Ready'
      : 'Your Full StackZero Report';

    const result = await resend.emails.send({
      from: 'StackZero Reports <reports@stackzero.ai>',
      to: email,
      subject,
      html,
      attachments: [
        {
          filename: 'stackzero_report.pdf',
          content: pdfBuffer.toString('base64'),
        },
      ],
    });

    console.log('[EMAIL SENT]', result);
    return true;
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return false;
  }
}
