import { NextRequest, NextResponse } from 'next/server';
import {
  sendApplicationAcknowledgedEmail,
  sendAdmissionWelcomeEmail,
  sendPortalAccessWelcomeEmail,
  sendTeacherAppointmentEmail,
  sendTermFeeInvoiceEmail,
  sendFeeReceiptEmail,
  sendOutstandingBalanceReminderEmail,
  sendServicePassConfirmationEmail,
  sendMidtermProgressReportEmail,
  sendReportCardEmail,
  sendAcademicCommendationEmail,
  sendAbsenceAlertEmail,
  sendLateArrivalNotificationEmail,
  sendClinicVisitReportEmail,
  sendBusDelayAlertEmail,
  sendExcursionConsentEmail,
  sendPrincipalNewsletterEmail,
  sendPtaMeetingNotificationEmail,
  sendUrgentCampusAdvisoryEmail
} from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json({ error: 'Missing type or payload' }, { status: 400 });
    }

    let result;

    switch (type) {
      // 1. Admissions & Onboarding
      case 'application_acknowledged':
        result = await sendApplicationAcknowledgedEmail(payload);
        break;
      case 'admission':
      case 'admission_welcome':
        result = await sendAdmissionWelcomeEmail(payload);
        break;
      case 'portal_access':
        result = await sendPortalAccessWelcomeEmail(payload);
        break;
      case 'teacher_appointment':
        result = await sendTeacherAppointmentEmail(payload);
        break;

      // 2. Bursary & Financial Communications
      case 'fee_invoice':
        result = await sendTermFeeInvoiceEmail(payload);
        break;
      case 'receipt':
      case 'fee_receipt':
        result = await sendFeeReceiptEmail(payload);
        break;
      case 'balance_reminder':
        result = await sendOutstandingBalanceReminderEmail(payload);
        break;
      case 'service_pass':
        result = await sendServicePassConfirmationEmail(payload);
        break;

      // 3. Academics & Assessments
      case 'midterm_progress':
      case 'ca_progress':
        result = await sendMidtermProgressReportEmail(payload);
        break;
      case 'report_card':
        result = await sendReportCardEmail(payload);
        break;
      case 'commendation':
      case 'honor_roll':
        result = await sendAcademicCommendationEmail(payload);
        break;

      // 4. Attendance, Welfare & Safeguarding
      case 'absence_alert':
        result = await sendAbsenceAlertEmail(payload);
        break;
      case 'late_arrival':
        result = await sendLateArrivalNotificationEmail(payload);
        break;
      case 'clinic_visit':
        result = await sendClinicVisitReportEmail(payload);
        break;

      // 5. Transport & Excursions
      case 'bus_delay':
        result = await sendBusDelayAlertEmail(payload);
        break;
      case 'excursion_consent':
        result = await sendExcursionConsentEmail(payload);
        break;

      // 6. Institutional Announcements & Governance
      case 'newsletter':
        result = await sendPrincipalNewsletterEmail(payload);
        break;
      case 'pta_meeting':
        result = await sendPtaMeetingNotificationEmail(payload);
        break;
      case 'urgent_advisory':
        result = await sendUrgentCampusAdvisoryEmail(payload);
        break;

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
