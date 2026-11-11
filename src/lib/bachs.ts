import crypto from 'crypto';

const BACHS_API_KEY = process.env.BACHS_API_KEY || '';
const BACHS_API_BASE_URL = process.env.BACHS_API_BASE_URL || 'https://sandbox-api.bachs.io';
const BACHS_WEBHOOK_SECRET = process.env.BACHS_WEBHOOK_SECRET || '';
const BACHS_ACCOUNT_ID = process.env.BACHS_ACCOUNT_ID || '';

export interface BachsCheckoutParams {
  invoiceId: string;
  invoiceNo: string;
  studentName: string;
  admissionNo?: string;
  guardianEmail: string;
  guardianName: string;
  amount: number; // in NGN
  currency?: string; // default 'NGN'
  successUrl?: string;
  cancelUrl?: string;
}

export interface BachsCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
  isMock?: boolean;
}

/**
 * Creates a hosted Checkout Session using Bachs.io REST API (/v1/checkout-sessions)
 */
export async function createBachsCheckoutSession({
  invoiceId,
  invoiceNo,
  studentName,
  admissionNo,
  guardianEmail,
  guardianName,
  amount,
  currency = 'NGN',
  successUrl,
  cancelUrl
}: BachsCheckoutParams): Promise<BachsCheckoutResult> {
  const isConfiguredKey =
    BACHS_API_KEY &&
    !BACHS_API_KEY.includes('your_bachs_api_key_here') &&
    BACHS_API_KEY.startsWith('sk_');

  // Bachs requires publicly accessible URLs and strictly rejects 'localhost'
  let safeSuccessUrl =
    successUrl ||
    process.env.NEXT_PUBLIC_BACHS_SUCCESS_URL ||
    'https://www.firstsons.xyz/dashboard/finance?payment=success';
  if (safeSuccessUrl.includes('localhost')) {
    safeSuccessUrl = 'https://www.firstsons.xyz/dashboard/finance?payment=success';
  }

  let safeCancelUrl =
    cancelUrl ||
    process.env.NEXT_PUBLIC_BACHS_CANCEL_URL ||
    'https://www.firstsons.xyz/dashboard/finance?payment=cancelled';
  if (safeCancelUrl.includes('localhost')) {
    safeCancelUrl = 'https://www.firstsons.xyz/dashboard/finance?payment=cancelled';
  }

  // If key is not yet configured or in mock/test mode, provide a simulated checkout response
  if (!isConfiguredKey) {
    const mockSessionId = `cs_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const mockCheckoutUrl = `${safeSuccessUrl}&session_id=${mockSessionId}&invoice_no=${encodeURIComponent(
      invoiceNo
    )}&amount=${amount}&mock=true`;

    console.log(
      `[Bachs Simulation] Generated sandbox checkout session for Invoice ${invoiceNo} (₦${amount.toLocaleString()}) -> ${mockCheckoutUrl}`
    );

    return {
      success: true,
      checkoutUrl: mockCheckoutUrl,
      sessionId: mockSessionId,
      isMock: true
    };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${BACHS_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    // Format amount as two-decimal string as strictly required by Bachs schema ("10000.00")
    const formattedAmount = Number(amount).toFixed(2);

    const payload = {
      pricing: {
        amount: formattedAmount,
        currency: currency.toUpperCase()
      },
      customer: {
        email: guardianEmail,
        name: guardianName
      },
      metadata: {
        invoiceId,
        invoiceNo,
        studentName,
        admissionNo: admissionNo || '',
        institution: 'Dominion International School'
      },
      success_url: `${safeSuccessUrl}&session_id={CHECKOUT_SESSION_ID}&invoice_no=${encodeURIComponent(invoiceNo)}`,
      cancel_url: `${safeCancelUrl}&invoice_no=${encodeURIComponent(invoiceNo)}`
    };

    const res = await fetch(`${BACHS_API_BASE_URL}/v1/checkout-sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[Bachs API Error ${res.status}]`, data);
      return {
        success: false,
        error: data.detail || data.message || `Bachs Gateway Error: ${res.statusText}`
      };
    }

    console.log(`[Bachs Success] Created live checkout session on Bachs.io:`, data.checkout_id, data.checkout_url);

    return {
      success: true,
      checkoutUrl: data.checkout_url || data.url,
      sessionId: data.checkout_id || data.id || data.session_id,
      isMock: false
    };
  } catch (err: any) {
    console.error('[Bachs Connection Error]', err);
    return {
      success: false,
      error: err.message || 'Unable to establish connection with Bachs.io API'
    };
  }
}

/**
 * Verifies the Bachs webhook signature header (X-Bachs-Signature) using HMAC-SHA256
 */
export function verifyBachsWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader || !BACHS_WEBHOOK_SECRET) {
    // In dev or sandbox when secret is not configured, permit testing
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', BACHS_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(computedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Returns school bank accounts and bursary instructions for offline payments
 */
export function getOfflinePaymentInstructions() {
  return {
    bankName: process.env.NEXT_PUBLIC_SCHOOL_BANK_NAME || 'Zenith Bank Plc',
    accountName: process.env.NEXT_PUBLIC_SCHOOL_ACCOUNT_NAME || 'Dominion International School',
    accountNumber: process.env.NEXT_PUBLIC_SCHOOL_ACCOUNT_NUMBER || '1015894321',
    bursaryPhone: process.env.NEXT_PUBLIC_SCHOOL_BURSARY_PHONE || '+234 (0) 803 123 4567',
    referenceNote:
      process.env.NEXT_PUBLIC_SCHOOL_PAYMENT_REFERENCE_NOTE ||
      'Use Student Admission No as payment narration / reference'
  };
}

