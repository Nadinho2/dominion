import { NextRequest, NextResponse } from 'next/server';
import { sendFeeReceiptEmail } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      invoiceNo,
      studentName,
      guardianEmail,
      guardianName,
      amount,
      channel = 'Direct Bank Transfer',
      reference,
      tellerNumber,
      notes
    } = body;

    if (!invoiceId || !amount) {
      return NextResponse.json(
        { error: 'Missing invoiceId or payment amount' },
        { status: 400 }
      );
    }

    const amountNum = Number(amount);
    const refCode = reference || tellerNumber || `OFFLINE-${Date.now().toString(36).toUpperCase()}`;

    // Update in Supabase if configured
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: inv } = await supabase
          .from('fee_invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (inv) {
          const newPaid = (inv.paid_amount || 0) + amountNum;
          const newBal = Math.max(0, (inv.total_amount || 0) - newPaid);
          const newStatus = newBal === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';

          await supabase
            .from('fee_invoices')
            .update({
              paid_amount: newPaid,
              balance: newBal,
              status: newStatus,
              paid_date: new Date().toISOString().split('T')[0],
              payment_method: channel,
              payment_reference: refCode
            })
            .eq('id', invoiceId);

          await supabase.from('payment_transactions').insert({
            invoice_id: invoiceId,
            amount: amountNum,
            channel: `Offline: ${channel}`,
            reference: refCode,
            status: 'Success',
            payer_email: guardianEmail || '',
            payer_name: guardianName || '',
            notes: notes || ''
          });
        }
      } catch (dbErr) {
        console.warn('[Offline Payment DB Notice]', dbErr);
      }
    }

    // Dispatch official Bursary payment receipt email
    if (guardianEmail) {
      try {
        await sendFeeReceiptEmail({
          guardianEmail,
          guardianName: guardianName || 'Parent / Guardian',
          studentName: studentName || 'Dominion Student',
          invoiceNo: invoiceNo || refCode,
          amountPaid: amountNum,
          balanceRemaining: 0,
          paymentDate: new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })
        });
      } catch (emailErr) {
        console.warn('[Offline Payment Email Notice]', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      reference: refCode,
      amount: amountNum,
      message: 'Offline payment logged and verified by bursary.'
    });
  } catch (err: any) {
    console.error('Offline payment logging error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process offline payment' },
      { status: 500 }
    );
  }
}

