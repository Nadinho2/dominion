import { NextRequest, NextResponse } from 'next/server';
import { createBachsCheckoutSession } from '@/lib/bachs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      invoiceNo,
      studentName,
      admissionNo,
      guardianEmail,
      guardianName,
      amount,
      currency = 'NGN'
    } = body;

    if (!invoiceId || !amount || !guardianEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters: invoiceId, amount, and guardianEmail are required.' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || req.nextUrl.origin || 'http://localhost:3000';
    const successUrl = `${origin}/dashboard/finance?payment=success`;
    const cancelUrl = `${origin}/dashboard/finance?payment=cancelled`;

    const result = await createBachsCheckoutSession({
      invoiceId,
      invoiceNo: invoiceNo || `INV-${Date.now()}`,
      studentName: studentName || 'Dominion Student',
      admissionNo,
      guardianEmail,
      guardianName: guardianName || 'Parent / Guardian',
      amount: Number(amount),
      currency,
      successUrl,
      cancelUrl
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initialize Bachs checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      isMock: result.isMock
    });
  } catch (err: any) {
    console.error('Bachs checkout initialization error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

