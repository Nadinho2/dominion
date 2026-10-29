import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'admissions@dominioninternational.sch.ng';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 1. Send Admission Welcome Email to Student & Parent
 */
export async function sendAdmissionWelcomeEmail({
  guardianEmail,
  guardianName,
  studentName,
  admissionNo,
  classLevel,
  house
}: {
  guardianEmail: string;
  guardianName: string;
  studentName: string;
  admissionNo: string;
  classLevel: string;
  house: string;
}): Promise<EmailResult> {
  if (!resend) {
    console.log(`[Resend Mock] Admission Welcome Email to ${guardianEmail} for ${studentName} (${admissionNo})`);
    return { success: true, messageId: 'mock-admission-email-id' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Dominion International School <${FROM_EMAIL}>`,
      to: [guardianEmail],
      subject: `Official Admission Letter: ${studentName} (${admissionNo}) - Dominion International School`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #061224; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; color: #f3be58;">DOMINION INTERNATIONAL SCHOOL</h1>
            <p style="margin: 4px 0 0; font-size: 13px; font-style: italic;">"Dominion Through Excellence" &bull; Ajao Estate, Lagos</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <p>Dear <strong>${guardianName}</strong>,</p>
            <p>Congratulations! We are delighted to inform you that <strong>${studentName}</strong> has been officially enrolled at Dominion International School for the 2026/2027 Academic Session.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #d49a37; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px;"><strong>Official Admission Number:</strong> ${admissionNo}</p>
              <p style="margin: 0 0 8px;"><strong>Class Level &amp; Arm:</strong> ${classLevel}</p>
              <p style="margin: 0;"><strong>Allocated Sports House:</strong> ${house} House</p>
            </div>

            <p>You can access the parent portal and monitor academic records, timetables, and bursary invoices anytime at:</p>
            <p><a href="http://localhost:3000/dashboard" style="background-color: #d49a37; color: #061224; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log into School Portal</a></p>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
              Warm regards,<br>
              <strong>Office of Admissions &amp; Records</strong><br>
              Plot 14/16 Airport Road, Ajao Estate, Ikeja, Lagos<br>
              Phone: +234 (0) 803 123 4567
            </p>
          </div>
        </div>
      `
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Terminal Report Card Notification Email
 */
export async function sendReportCardEmail({
  guardianEmail,
  guardianName,
  studentName,
  term,
  session,
  average
}: {
  guardianEmail: string;
  guardianName: string;
  studentName: string;
  term: string;
  session: string;
  average: number;
}): Promise<EmailResult> {
  if (!resend) {
    console.log(`[Resend Mock] Report Card Email to ${guardianEmail} for ${studentName} (${average}%)`);
    return { success: true, messageId: 'mock-report-card-id' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Dominion Academics <${FROM_EMAIL}>`,
      to: [guardianEmail],
      subject: `Terminal Assessment Dossier: ${studentName} - ${term} ${session}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #061224; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; color: #f3be58;">DOMINION INTERNATIONAL SCHOOL</h1>
            <p style="margin: 4px 0 0; font-size: 13px;">Terminal Assessment Notification &bull; ${term} ${session}</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <p>Dear <strong>${guardianName}</strong>,</p>
            <p>The ${term} ${session} academic results and Continuous Assessment dossier for <strong>${studentName}</strong> have been finalized and published.</p>
            
            <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 8px; font-size: 16px; font-weight: bold; color: #065f46;">Term Aggregate Average: ${average}%</p>
              <p style="margin: 0; font-size: 13px; color: #047857;">Official remarks and subject breakdowns are available on the school management portal.</p>
            </div>

            <p><a href="http://localhost:3000/dashboard/grades" style="background-color: #061224; color: #f3be58; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download Official Report Card (PDF)</a></p>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
              Principal: <strong>Olwaseyi (PhD, FIMC)</strong><br>
              Dominion International School
            </p>
          </div>
        </div>
      `
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 3. Send Fee Payment Receipt Confirmation Email
 */
export async function sendFeeReceiptEmail({
  guardianEmail,
  guardianName,
  studentName,
  invoiceNo,
  amountPaid,
  balanceRemaining
}: {
  guardianEmail: string;
  guardianName: string;
  studentName: string;
  invoiceNo: string;
  amountPaid: number;
  balanceRemaining: number;
}): Promise<EmailResult> {
  if (!resend) {
    console.log(`[Resend Mock] Fee Receipt Email to ${guardianEmail} for ${invoiceNo} (Paid: ₦${amountPaid})`);
    return { success: true, messageId: 'mock-receipt-email-id' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Dominion Bursary <${FROM_EMAIL}>`,
      to: [guardianEmail],
      subject: `Official Payment Receipt: ${invoiceNo} - Dominion International School`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #061224; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; color: #f3be58;">DOMINION INTERNATIONAL SCHOOL</h1>
            <p style="margin: 4px 0 0; font-size: 13px;">Bursary Directorate &bull; Official Receipt</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <p>Dear <strong>${guardianName}</strong>,</p>
            <p>We gratefully acknowledge receipt of payment for <strong>${studentName}</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Invoice Number:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${invoiceNo}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Credited:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #16a34a; font-weight: bold;">&#8358;${amountPaid.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Outstanding Balance:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">&#8358;${balanceRemaining.toLocaleString()}</td></tr>
            </table>

            <p><a href="http://localhost:3000/dashboard/finance" style="background-color: #d49a37; color: #061224; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Bursary Ledger</a></p>
          </div>
        </div>
      `
    });

    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

