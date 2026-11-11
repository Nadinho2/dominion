import { NextRequest, NextResponse } from 'next/server';
import { verifyBachsWebhookSignature } from '@/lib/bachs';
import { sendFeeReceiptEmail } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-bachs-signature');

    // 1. Verify webhook signature
    const isValid = verifyBachsWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[Bachs Webhook] Invalid signature attempt rejected');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.type || event.event;
    console.log(`[Bachs Webhook] Received verified event: ${eventType}`, event.id);

    // 2. Handle successful checkout / payment events
    if (eventType === 'checkout.completed' || eventType === 'collection.succeeded') {
      const session = event.data?.object || event.data || {};
      const metadata = session.metadata || {};
      const invoiceId = metadata.invoiceId;
      const invoiceNo = metadata.invoiceNo || session.reference || `DIS-INV-${Date.now()}`;
      const studentName = metadata.studentName || 'Dominion Scholar';
      const guardianEmail = session.customer?.email || metadata.guardianEmail;
      const guardianName = session.customer?.name || metadata.guardianName || 'Parent / Guardian';
      const amountPaid = Number(session.pricing?.amount || session.amount || 0);

      console.log(
        `[Bachs Webhook] Fulfilling payment for Invoice: ${invoiceNo}, Student: ${studentName}, Amount: ₦${amountPaid.toLocaleString()}`
      );

      // 3. Update invoice in Supabase database if connected
      if (supabaseUrl && supabaseServiceKey && invoiceId) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          const { data: inv } = await supabase
            .from('fee_invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();

          if (inv) {
            const newPaid = (inv.paid_amount || 0) + amountPaid;
            const newBal = Math.max(0, (inv.total_amount || 0) - newPaid);
            const newStatus = newBal === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';

            await supabase
              .from('fee_invoices')
              .update({
                paid_amount: newPaid,
                balance: newBal,
                status: newStatus,
                paid_date: new Date().toISOString().split('T')[0],
                payment_method: 'Bachs Online',
                payment_reference: session.id || session.reference || 'bachs_online'
              })
              .eq('id', invoiceId);

            // Record transaction row
            await supabase.from('payment_transactions').insert({
              invoice_id: invoiceId,
              amount: amountPaid,
              channel: 'Bachs.io Hosted Checkout',
              reference: session.id || session.reference || `bachs-${Date.now()}`,
              status: 'Success',
              payer_email: guardianEmail || '',
              payer_name: guardianName || ''
            });
          }
        } catch (dbErr) {
          console.warn('[Bachs Webhook DB Notice]', dbErr);
        }
      }

      // 4. Automatically dispatch Bursary Receipt confirmation email
      if (guardianEmail) {
        try {
          await sendFeeReceiptEmail({
            guardianEmail,
            guardianName,
            studentName,
            invoiceNo,
            amountPaid,
            balanceRemaining: 0,
            paymentDate: new Date().toLocaleDateString('en-NG', { dateStyle: 'long' })
          });
        } catch (emailErr) {
          console.warn('[Bachs Webhook Receipt Notice]', emailErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Bachs Webhook Handler Error]', err);
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

