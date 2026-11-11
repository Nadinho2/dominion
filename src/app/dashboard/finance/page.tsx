'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Printer,
  X,
  Receipt,
  Shield,
  ArrowUpRight,
  Globe,
  Building,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { FeeInvoice } from '../../../lib/types';

export default function FinancePage() {
  const { fees, students, recordPayment } = useSchoolStore();

  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  
  // Payment Mode: 'bachs' | 'offline'
  const [paymentMode, setPaymentMode] = useState<'bachs' | 'offline'>('bachs');
  const [offlineChannel, setOfflineChannel] = useState('Direct Bank Transfer');
  const [offlineReference, setOfflineReference] = useState('');
  const [payerName, setPayerName] = useState('');
  const [offlineNotes, setOfflineNotes] = useState('');

  // Bachs loading & checkout state
  const [isBachsLoading, setIsBachsLoading] = useState(false);
  const [bachsCheckoutUrl, setBachsCheckoutUrl] = useState<string | null>(null);

  // Success / notification banners
  const [copiedBank, setCopiedBank] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'cancelled' | 'info'; message: string } | null>(null);

  // Read URL query parameters on mount for payment returns
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const invoiceNo = params.get('invoice_no');
      const amount = params.get('amount');

      if (paymentStatus === 'success') {
        setPaymentNotice({
          type: 'success',
          message: `Payment successfully completed via Bachs.io Gateway${invoiceNo ? ` for Invoice ${invoiceNo}` : ''}! The bursary ledger has been credited and a verified receipt was dispatched.`
        });
        // Auto-fulfill in local store if invoice exists
        if (invoiceNo) {
          const inv = fees.find((f) => f.invoiceNo === invoiceNo);
          if (inv && inv.balance > 0) {
            recordPayment(inv.id, amount ? Number(amount) : inv.balance);
          }
        }
      } else if (paymentStatus === 'cancelled') {
        setPaymentNotice({
          type: 'cancelled',
          message: 'The online payment session was cancelled. You can retry with Bachs.io or settle your balance via direct bank transfer below.'
        });
      }
    }
  }, [fees, recordPayment]);

  const totalInvoiced = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((acc, f) => acc + f.balance, 0);

  const handleOpenPay = (inv: FeeInvoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balance);
    setPaymentMode('bachs');
    setBachsCheckoutUrl(null);
    setOfflineReference('');
    setPayerName('');
    setIsPayModalOpen(true);
  };

  // 1. Initialize Bachs.io Checkout Session
  const handleInitiateBachsPayment = async () => {
    if (!selectedInvoice || payAmount <= 0) return;
    setIsBachsLoading(true);

    const student = students.find((s) => s.id === selectedInvoice.studentId);

    try {
      const res = await fetch('/api/payments/bachs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          invoiceNo: selectedInvoice.invoiceNo,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Dominion Student',
          admissionNo: student?.admissionNo,
          guardianEmail: student?.guardianEmail || 'nnamdiamuchie@gmail.com',
          guardianName: student?.guardianName || 'Parent / Guardian',
          amount: Number(payAmount),
          currency: 'NGN'
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        setBachsCheckoutUrl(data.checkoutUrl);
        // Automatically open or navigate to the Bachs Checkout URL
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert(data.error || 'Failed to initialize Bachs checkout session.');
      }
    } catch (err: any) {
      console.error('Bachs checkout error:', err);
      alert('Network error connecting to Bachs.io gateway.');
    } finally {
      setIsBachsLoading(false);
    }
  };

  // 2. Confirm simulated payment completion in dev
  const handleSimulatePaymentCompletion = () => {
    if (!selectedInvoice) return;
    const amountNum = Number(payAmount);
    recordPayment(selectedInvoice.id, amountNum);

    const student = students.find((s) => s.id === selectedInvoice.studentId);
    if (student?.guardianEmail) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fee_receipt',
          payload: {
            guardianEmail: student.guardianEmail,
            guardianName: student.guardianName || 'Parent / Guardian',
            studentName: `${student.firstName} ${student.lastName}`,
            invoiceNo: selectedInvoice.invoiceNo,
            amountPaid: amountNum,
            balanceRemaining: Math.max(0, selectedInvoice.balance - amountNum)
          }
        })
      }).catch((e) => console.warn(e));
    }

    setIsPayModalOpen(false);
    setSelectedInvoice(null);
    setPaymentNotice({
      type: 'success',
      message: `Online payment of ₦${amountNum.toLocaleString()} processed successfully via Bachs.io Gateway!`
    });
  };

  // 3. Confirm Offline Payment (Bank Transfer, Cash, POS)
  const handleConfirmOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    const student = students.find((s) => s.id === selectedInvoice.studentId);
    const amountNum = Number(payAmount);
    const newBalance = Math.max(0, selectedInvoice.balance - amountNum);

    recordPayment(selectedInvoice.id, amountNum);

    // Call server-side offline payment logging endpoint
    fetch('/api/payments/offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: selectedInvoice.id,
        invoiceNo: selectedInvoice.invoiceNo,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Dominion Student',
        guardianEmail: student?.guardianEmail,
        guardianName: student?.guardianName,
        amount: amountNum,
        channel: offlineChannel,
        reference: offlineReference,
        notes: offlineNotes
      })
    }).catch((err) => console.warn('Offline logging notice:', err));

    setIsPayModalOpen(false);
    setSelectedInvoice(null);
    setPaymentNotice({
      type: 'success',
      message: `Offline payment of ₦${amountNum.toLocaleString()} (${offlineChannel}) verified and credited to ${selectedInvoice.invoiceNo}.`
    });
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText('1015894321');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Return Notice Banner */}
      {paymentNotice && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: paymentNotice.type === 'success' ? '#ecfdf5' : '#fff1f2',
            border: `1px solid ${paymentNotice.type === 'success' ? '#a7f3d0' : '#fecdd3'}`,
            color: paymentNotice.type === 'success' ? '#065f46' : '#991b1b',
            fontSize: '0.9rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {paymentNotice.type === 'success' ? <CheckCircle size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
            <span>{paymentNotice.message}</span>
          </div>
          <button
            onClick={() => setPaymentNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Tuition &amp; School Finance Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Process termly student tuition, bus routes, laboratory levies via <strong>Bachs.io Payment Gateway</strong> or <strong>Offline Bank Transfer</strong>.
          </p>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--gold-badge)', color: '#b45309' }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Invoiced (Term 1)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              &#8358;{totalInvoiced.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dominion 2026/2027 Session</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Realized &amp; Paid</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald)' }}>
              &#8358;{totalPaid.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--emerald)' }}>
              {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0}% Collection Rate
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--ruby-bg)', color: 'var(--ruby)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Outstanding Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ruby)' }}>
              &#8358;{totalOutstanding.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--ruby)' }}>Pending Bursary Clearance</div>
          </div>
        </div>
      </div>

      {/* Dual Payment Options Callout */}
      <div
        className="card"
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          padding: '1.25rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}
      >
        {/* Gateway Option */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#061224',
              color: '#f3be58',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d49a37', textTransform: 'uppercase' }}>
              Online Gateway &bull; Bachs.io
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#061224' }}>
              Instant Cards, Bank Transfer, USSD &amp; Mobile Money
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>
              Parents pay securely online. Checkouts are automatically verified and instant official receipts are issued.
            </p>
          </div>
        </div>

        {/* Offline Option */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderLeft: '1px solid #e2e8f0', paddingLeft: '1.5rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
              Offline / Bank Teller &bull; Zenith Bank
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#061224' }}>
              Acct: 1015894321 &bull; Dominion Int&apos;l School
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Reference: <strong>Student Admission No</strong></span>
              <button
                onClick={copyAccountNumber}
                className="btn btn-outline btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.7rem' }}
              >
                {copiedBank ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                {copiedBank ? 'Copied' : 'Copy Acct'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tuition Invoice Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Student &amp; Class</th>
              <th>Term / Session</th>
              <th>Total Bill</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No fee invoices generated yet.
                </td>
              </tr>
            ) : (
              fees.map((inv) => {
                const student = students.find((s) => s.id === inv.studentId);
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700 }}>{inv.invoiceNo}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {student ? `${student.classLevel} (${student.arm}) • ${student.admissionNo}` : '—'}
                      </div>
                    </td>
                    <td>
                      <div>{inv.term}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.session}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>&#8358;{inv.totalAmount.toLocaleString()}</td>
                    <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>&#8358;{inv.paidAmount.toLocaleString()}</td>
                    <td style={{ color: inv.balance > 0 ? 'var(--ruby)' : 'inherit', fontWeight: 700 }}>
                      &#8358;{inv.balance.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          inv.status === 'Paid'
                            ? 'badge-emerald'
                            : inv.status === 'Partial'
                            ? 'badge-gold'
                            : 'badge-ruby'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {inv.balance > 0 && (
                          <button
                            onClick={() => handleOpenPay(inv)}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <CreditCard size={14} /> Pay Fee
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Receipt size={14} /> Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Process Fee Payment (Bachs.io Online OR Offline Bank Transfer) */}
      {isPayModalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Process Tuition Payment
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Invoice: <strong>{selectedInvoice.invoiceNo}</strong> &bull; Outstanding: <strong>&#8358;{selectedInvoice.balance.toLocaleString()}</strong>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Payment Method Switcher Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMode('bachs')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  borderBottom: paymentMode === 'bachs' ? '3px solid #d49a37' : '3px solid transparent',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: paymentMode === 'bachs' ? '#061224' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Globe size={16} color={paymentMode === 'bachs' ? '#d49a37' : '#64748b'} />
                Online via Bachs.io
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('offline')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: 'none',
                  background: 'none',
                  borderBottom: paymentMode === 'offline' ? '3px solid #059669' : '3px solid transparent',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: paymentMode === 'offline' ? '#061224' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <Building size={16} color={paymentMode === 'offline' ? '#059669' : '#64748b'} />
                Offline / Bank Teller
              </button>
            </div>

            {/* TAB 1: BACHS.IO ONLINE GATEWAY */}
            {paymentMode === 'bachs' && (
              <div>
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Payment Amount to Charge (&#8358;)
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={selectedInvoice.balance}
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="form-input"
                    style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '0.35rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setPayAmount(selectedInvoice.balance)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.7rem' }}
                    >
                      Pay Full (&#8358;{selectedInvoice.balance.toLocaleString()})
                    </button>
                    {selectedInvoice.balance > 100000 && (
                      <button
                        type="button"
                        onClick={() => setPayAmount(Math.round(selectedInvoice.balance / 2))}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.7rem' }}
                      >
                        Pay 50% (&#8358;{Math.round(selectedInvoice.balance / 2).toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffdfa', border: '1px solid #fef3c7', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#78350f' }}>
                  <strong>Accepted Payment Channels via Bachs.io:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span className="badge badge-sapphire" style={{ fontSize: '0.7rem' }}>Mastercard / Visa / Verve</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Direct Bank Transfer</span>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>USSD &amp; Mobile Money</span>
                    <span className="badge badge-topaz" style={{ fontSize: '0.7rem' }}>Multi-Currency</span>
                  </div>
                </div>

                {bachsCheckoutUrl ? (
                  <div style={{ textAlign: 'center', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <CheckCircle size={28} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                      Bachs.io Checkout Session Ready!
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#047857', margin: '0.25rem 0 1rem' }}>
                      Complete payment in the Bachs hosted tab, or simulate instant completion for testing:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <a
                        href={bachsCheckoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        Open Bachs.io Hosted Checkout <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={handleSimulatePaymentCompletion}
                        className="btn btn-outline"
                        style={{ borderColor: '#059669', color: '#065f46', fontSize: '0.8rem' }}
                      >
                        Simulate Instant Payment Confirmation (Sandbox)
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInitiateBachsPayment}
                    disabled={isBachsLoading || payAmount <= 0}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {isBachsLoading ? 'Generating Bachs.io Session...' : `Launch Bachs.io Checkout (₦${payAmount.toLocaleString()}) →`}
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: OFFLINE PAYMENT (ZENITH BANK / POS / CASH) */}
            {paymentMode === 'offline' && (
              <form onSubmit={handleConfirmOfflinePayment}>
                {/* Official Bank Account Information */}
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Dominion Official Bank Transfer Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div><strong>Bank:</strong> Zenith Bank Plc</div>
                    <div><strong>Account No:</strong> 1015894321</div>
                    <div style={{ gridColumn: 'span 2' }}><strong>Account Name:</strong> Dominion International School</div>
                    <div style={{ gridColumn: 'span 2', color: '#047857', fontSize: '0.75rem' }}>
                      Mandatory Narration: <strong>{students.find((s) => s.id === selectedInvoice.studentId)?.admissionNo || selectedInvoice.invoiceNo}</strong>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (&#8358;) *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedInvoice.balance}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Channel *</label>
                  <select
                    value={offlineChannel}
                    onChange={(e) => setOfflineChannel(e.target.value)}
                    className="form-select"
                  >
                    <option value="Direct Bank Transfer (Zenith Bank)">Direct Bank Transfer (Zenith Bank)</option>
                    <option value="Moniepoint POS Terminal (Bursary Desk)">Moniepoint POS Terminal (Bursary Desk)</option>
                    <option value="Bank Teller Cash Deposit">Bank Teller Cash Deposit</option>
                    <option value="Cash at Bursary">Cash at Bursary Desk</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Bank Teller / POS Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. ZEN-TXN-894021"
                      value={offlineReference}
                      onChange={(e) => setOfflineReference(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Depositor / Payer Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Adebayo Nnamdi"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bursary Notes / Remark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Paid in full via Zenith Bank mobile app transfer"
                    value={offlineNotes}
                    onChange={(e) => setOfflineNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#059669', borderColor: '#059669' }}>
                    Confirm &amp; Record Offline Payment
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Modal: Official Bursary Receipt */}
      {selectedInvoice && !isPayModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Dominion School Bursary Receipt</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => window.print()} className="btn btn-primary">
                  <Printer size={16} /> Print Receipt
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="btn btn-outline">
                  Close
                </button>
              </div>
            </div>

            {/* Official Receipt Sheet */}
            <div
              style={{
                border: '2px solid var(--gold-primary)',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff'
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary-navy)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <Shield size={32} color="var(--primary-navy)" style={{ margin: '0 auto 0.5rem' }} />
                <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--primary-navy)' }}>
                  DOMINION INTERNATIONAL SCHOOL
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Plot 14/16 Airport Road, Ajao Estate, Ikeja, Lagos State &bull; Bursary Directorate
                </div>
                <div style={{ marginTop: '0.5rem', fontWeight: 800, color: '#b45309', fontSize: '0.85rem' }}>
                  OFFICIAL PAYMENT RECEIPT &bull; {selectedInvoice.invoiceNo}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <div><strong>Date Issued:</strong> {selectedInvoice.paidDate || '2026-10-29'}</div>
                <div><strong>Session/Term:</strong> {selectedInvoice.term} ({selectedInvoice.session})</div>
                <div>
                  <strong>Student:</strong>{' '}
                  {students.find((s) => s.id === selectedInvoice.studentId)?.firstName}{' '}
                  {students.find((s) => s.id === selectedInvoice.studentId)?.lastName}
                </div>
                <div>
                  <strong>Adm No:</strong>{' '}
                  {students.find((s) => s.id === selectedInvoice.studentId)?.admissionNo}
                </div>
              </div>

              {/* Items Breakdown */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount (&#8358;)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Tuition &amp; Cambridge Curriculum</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>&#8358;{(selectedInvoice.tuitionFee || (selectedInvoice.totalAmount ? selectedInvoice.totalAmount - (selectedInvoice.developmentLevy || 0) - (selectedInvoice.ictRobotics || 0) - (selectedInvoice.busFee || 0) : 0)).toLocaleString()}</td>
                  </tr>
                  {selectedInvoice.developmentLevy ? (
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Development &amp; Campus Facilities</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>&#8358;{(selectedInvoice.developmentLevy || 0).toLocaleString()}</td>
                    </tr>
                  ) : null}
                  {selectedInvoice.ictRobotics ? (
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>ICT &amp; Robotics Laboratory</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>&#8358;{(selectedInvoice.ictRobotics || 0).toLocaleString()}</td>
                    </tr>
                  ) : null}
                  {selectedInvoice.busFee ? (
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Air-Conditioned Bus Service</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>&#8358;{(selectedInvoice.busFee || 0).toLocaleString()}</td>
                    </tr>
                  ) : null}
                  {selectedInvoice.lunchFee ? (
                    <tr>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>Daily Hot Lunch Program</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #f1f5f9' }}>&#8358;{(selectedInvoice.lunchFee || 0).toLocaleString()}</td>
                    </tr>
                  ) : null}
                  <tr style={{ fontWeight: 800, borderTop: '2px solid #000' }}>
                    <td style={{ padding: '0.5rem' }}>Total Fee Invoiced</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>&#8358;{(selectedInvoice.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                  <tr style={{ fontWeight: 800, color: 'var(--emerald)' }}>
                    <td style={{ padding: '0.5rem' }}>Total Paid to Date</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>&#8358;{(selectedInvoice.paidAmount || 0).toLocaleString()}</td>
                  </tr>
                  <tr style={{ fontWeight: 800, color: (selectedInvoice.balance || 0) > 0 ? 'var(--ruby)' : 'inherit' }}>
                    <td style={{ padding: '0.5rem' }}>Balance Remaining</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>&#8358;{(selectedInvoice.balance || 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                <div>Bursar Stamp: <em>VERIFIED &bull; DIS BURSARY</em></div>
                <div>Status: <strong style={{ color: selectedInvoice.status === 'Paid' ? 'var(--emerald)' : 'var(--topaz)' }}>{selectedInvoice.status.toUpperCase()}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
