import { NextRequest, NextResponse } from 'next/server';
import {
  sendAdmissionWelcomeEmail,
  sendReportCardEmail,
  sendFeeReceiptEmail
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
      case 'admission':
        result = await sendAdmissionWelcomeEmail(payload);
        break;
      case 'report_card':
        result = await sendReportCardEmail(payload);
        break;
      case 'receipt':
        result = await sendFeeReceiptEmail(payload);
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

