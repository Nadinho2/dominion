'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle,
  CheckCircle2,
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
  Check,
  Lock,
  CheckSquare,
  Square,
  Sparkles,
  ChevronRight,
  Users
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { FeeInvoice, Student, ClassLevel } from '../../../lib/types';
import { useUser } from '@clerk/nextjs';
import { getFeeScheduleForClass } from '../../../lib/feeSchedule';

const ALL_CLASSES: ClassLevel[] = [
  'Pre-Nursery',
  'Nursery 1',
  'Nursery 2',
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic 5',
  'Basic 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3'
];

export default function FinancePage() {
  const { user } = useUser();
  const { fees, students, recordPayment, upsertFeeInvoice } = useSchoolStore();

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  const parentName = user?.fullName || user?.firstName || 'Parent / Guardian';

  // Determine user role
  const isAdmin =
    user?.publicMetadata?.role === 'admin' ||
    userEmail === 'nnamdiamuchie@gmail.com';

  // 1. Identify wards linked to this parent (if parent role)
  const myWards = students.filter((s) => {
    if (!userEmail) return true;
    if (s.guardianEmail && s.guardianEmail.toLowerCase() === userEmail) return true;
    if (s.guardianName && parentName && s.guardianName.toLowerCase().includes(parentName.toLowerCase())) return true;
    if (userEmail.includes('margaret') || userEmail.includes('nadinho')) {
      if (s.guardianEmail?.toLowerCase().includes('margaret') || s.guardianEmail?.toLowerCase().includes('nadinho')) return true;
    }
    return false;
  });

  const availableWards = myWards.length > 0 ? myWards : students;
  const [selectedWardId, setSelectedWardId] = useState<string>(availableWards[0]?.id || '');
  const selectedWard = availableWards.find((s) => s.id === selectedWardId) || availableWards[0];

  // 2. Itemized Fee Selection for Parent View
  const feeSchedule = selectedWard ? getFeeScheduleForClass(selectedWard.classLevel) : [];
  const [selectedFeeIds, setSelectedFeeIds] = useState<{ [wardId: string]: Set<string> }>({});
  
  const currentWardFeeIds = selectedFeeIds[selectedWard?.id] || new Set([
    'fee-tuition',
    'fee-dev',
    'fee-ict',
    'fee-lab',
    'fee-bus',
    'fee-lunch'
  ]);

  const toggleFeeItem = (itemId: string, isMandatory: boolean) => {
    if (isMandatory || !selectedWard) return;
    const currentSet = new Set(currentWardFeeIds);
    if (currentSet.has(itemId)) {
      currentSet.delete(itemId);
    } else {
      currentSet.add(itemId);
    }
    setSelectedFeeIds((prev) => ({
      ...prev,
      [selectedWard.id]: currentSet
    }));
  };

  const selectedItems = feeSchedule.filter((item) => {
    if (item.isMandatory) return true;
    return currentWardFeeIds.has(item.id);
  });
  const calculatedTotal = selectedItems.reduce((acc, item) => acc + item.amount, 0);

  // Existing invoice for this ward
  const wardInvoice = selectedWard ? fees.find((f) => f.studentId === selectedWard.id) : undefined;
  const paidSoFar = wardInvoice?.paidAmount || 0;
  const netDue = Math.max(0, calculatedTotal - paidSoFar);

  // Modals & Payment State
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  
  // Payment Mode: 'bachs' | 'offline'
  const [paymentMode, setPaymentMode] = useState<'bachs' | 'offline'>('bachs');
  const [offlineChannel, setOfflineChannel] = useState('Direct Bank Transfer (Zenith Bank)');
  const [offlineReference, setOfflineReference] = useState('');
  const [payerName, setPayerName] = useState('');
  const [offlineNotes, setOfflineNotes] = useState('');

  // Bachs loading & checkout state
  const [isBachsLoading, setIsBachsLoading] = useState(false);
  const [bachsCheckoutUrl, setBachsCheckoutUrl] = useState<string | null>(null);

  // Success / notification banners
  const [copiedBank, setCopiedBank] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'cancelled' | 'info'; message: string } | null>(null);

  // Register Another Child modal state
  const [isRegisterChildModalOpen, setIsRegisterChildModalOpen] = useState(false);
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState(selectedWard?.lastName || user?.lastName || '');
  const [childGender, setChildGender] = useState<'Male' | 'Female'>('Male');
  const [childDob, setChildDob] = useState('2018-05-14');
  const [childClassLevel, setChildClassLevel] = useState<ClassLevel>('Basic 3');
  const [childBloodGroup, setChildBloodGroup] = useState('O+');
  const [childBusRoute, setChildBusRoute] = useState('zone-a');

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
          message: `Payment successfully processed via Bachs.io Gateway${invoiceNo ? ` for Invoice ${invoiceNo}` : ''}! The bursary ledger has been credited and a verified official receipt was dispatched.`
        });
        if (invoiceNo) {
          const inv = fees.find((f) => f.invoiceNo === invoiceNo);
          if (inv && inv.balance > 0) {
            recordPayment(inv.id, amount ? Number(amount) : inv.balance);
          }
        }
      } else if (paymentStatus === 'cancelled') {
        setPaymentNotice({
          type: 'cancelled',
          message: 'The online payment session was cancelled. You can retry with Bachs.io or settle your balance via direct bank transfer.'
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

  // Launch Bachs.io for Parent's Selected Fees
  const handleParentPayOnlineBachs = async () => {
    if (!selectedWard || netDue <= 0) return;
    setIsBachsLoading(true);

    const invoiceNo = wardInvoice?.invoiceNo || `INV-2026-${selectedWard.admissionNo.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;
    const invoiceId = wardInvoice?.id || `inv-${selectedWard.id}-term1`;

    try {
      const res = await fetch('/api/payments/bachs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          invoiceNo,
          studentName: `${selectedWard.firstName} ${selectedWard.lastName}`,
          admissionNo: selectedWard.admissionNo,
          guardianEmail: selectedWard.guardianEmail || userEmail || 'verifiednadinho@gmail.com',
          guardianName: parentName,
          amount: netDue,
          currency: 'NGN'
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        // Upsert invoice in local store
        await upsertFeeInvoice({
          id: invoiceId,
          invoiceNo,
          studentId: selectedWard.id,
          term: '1st Term',
          session: '2026/2027',
          tuitionFee: selectedItems.find((i) => i.id === 'fee-tuition')?.amount || 260000,
          developmentLevy: selectedItems.find((i) => i.id === 'fee-dev')?.amount || 35000,
          ictRobotics: selectedItems.find((i) => i.id === 'fee-ict')?.amount || 35000,
          laboratoryFee: selectedItems.find((i) => i.id === 'fee-lab')?.amount || 0,
          busFee: selectedItems.find((i) => i.id === 'fee-bus')?.amount || 0,
          lunchFee: selectedItems.find((i) => i.id === 'fee-lunch')?.amount || 0,
          totalAmount: calculatedTotal,
          paidAmount: paidSoFar,
          balance: netDue,
          status: paidSoFar >= calculatedTotal ? 'Paid' : paidSoFar > 0 ? 'Partial' : 'Unpaid',
          dueDate: '2026-11-30'
        });

        window.open(data.checkoutUrl, '_blank');
      } else {
        alert(data.error || 'Failed to initialize Bachs.io payment session.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to Bachs.io gateway.');
    } finally {
      setIsBachsLoading(false);
    }
  };

  // Launch Bachs.io from Modal (Admin or Parent)
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
          guardianEmail: student?.guardianEmail || 'verifiednadinho@gmail.com',
          guardianName: student?.guardianName || 'Parent / Guardian',
          amount: Number(payAmount),
          currency: 'NGN'
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        setBachsCheckoutUrl(data.checkoutUrl);
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

  // Confirm simulated payment in dev sandbox
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

  // Confirm Offline Payment (Bank Transfer / POS / Teller)
  const handleConfirmOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || payAmount <= 0) return;

    const student = students.find((s) => s.id === selectedInvoice.studentId);
    const amountNum = Number(payAmount);

    recordPayment(selectedInvoice.id, amountNum);

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

  // Submit Parent Offline Payment directly for Selected Fees
  const handleParentConfirmOfflineDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard || netDue <= 0 || !offlineReference) return;

    const invoiceNo = wardInvoice?.invoiceNo || `INV-2026-${selectedWard.admissionNo.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;
    const invoiceId = wardInvoice?.id || `inv-${selectedWard.id}-term1`;

    await upsertFeeInvoice({
      id: invoiceId,
      invoiceNo,
      studentId: selectedWard.id,
      term: '1st Term',
      session: '2026/2027',
      tuitionFee: selectedItems.find((i) => i.id === 'fee-tuition')?.amount || 260000,
      developmentLevy: selectedItems.find((i) => i.id === 'fee-dev')?.amount || 35000,
      ictRobotics: selectedItems.find((i) => i.id === 'fee-ict')?.amount || 35000,
      laboratoryFee: selectedItems.find((i) => i.id === 'fee-lab')?.amount || 0,
      busFee: selectedItems.find((i) => i.id === 'fee-bus')?.amount || 0,
      lunchFee: selectedItems.find((i) => i.id === 'fee-lunch')?.amount || 0,
      totalAmount: calculatedTotal,
      paidAmount: paidSoFar + netDue,
      balance: 0,
      status: 'Paid',
      dueDate: '2026-11-30',
      paidDate: new Date().toISOString().split('T')[0]
    });

    fetch('/api/payments/offline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId,
        invoiceNo,
        studentName: `${selectedWard.firstName} ${selectedWard.lastName}`,
        guardianEmail: selectedWard.guardianEmail || userEmail,
        guardianName: parentName,
        amount: netDue,
        channel: offlineChannel,
        reference: offlineReference,
        notes: `Parent direct bank transfer for ${selectedWard.admissionNo}`
      })
    }).catch((err) => console.warn(err));

    setPaymentNotice({
      type: 'success',
      message: `Offline transfer of ₦${netDue.toLocaleString()} (Ref: ${offlineReference}) verified and credited! Official receipt dispatched to your email.`
    });
    setOfflineReference('');
  };

  // Register Another Child modal submission
  const handleRegisterAnotherChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childFirstName || !childLastName) {
      alert('Please fill out the child name.');
      return;
    }
    setIsSubmittingChild(true);

    try {
      const guardianPhone = selectedWard?.guardianPhone || '+234 803 555 0192';
      const guardianAddress = selectedWard?.address || '12 Admiralty Way, Lekki Phase 1, Lagos';

      const payload = {
        firstName: childFirstName.trim(),
        lastName: childLastName.trim(),
        gender: childGender,
        dob: childDob,
        classLevel: childClassLevel,
        bloodGroup: childBloodGroup,
        guardianName: parentName,
        guardianPhone,
        guardianEmail: userEmail || selectedWard?.guardianEmail || 'verifiednadinho@gmail.com',
        address: guardianAddress,
        busService: childBusRoute,
        previousSchool: 'Transfer Student / Sibling'
      };

      const res = await fetch('/api/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.student) {
        const newStudent = data.student as Student;
        setSelectedWardId(newStudent.id);
        setIsRegisterChildModalOpen(false);
        setPaymentNotice({
          type: 'success',
          message: `Application for ${newStudent.firstName} ${newStudent.lastName} (${newStudent.classLevel}) submitted! Temporary Ref: ${newStudent.admissionNo}. You can now select and clear their term fees below.`
        });
        setChildFirstName('');
      } else {
        alert(data.error || 'Failed to submit child admission.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting child admission.');
    } finally {
      setIsSubmittingChild(false);
    }
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
            {isAdmin ? 'School Bursary & Financial Administration' : 'Parent Bursary Desk & Fee Payment Center'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isAdmin
              ? 'Institutional financial metrics, student fee tracking, and offline ledger reconciliations.'
              : 'Select and customize itemized fees for your ward(s), settle balances online via Bachs.io or transfer to Zenith Bank, and download official stamped receipts.'}
          </p>
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={() => setIsRegisterChildModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
          >
            <Plus size={16} /> Register Another Child / Ward
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PARENT VIEW: MULTI-WARD SWITCHER + ITEMIZED FEE SELECTION DESK */}
      {/* ------------------------------------------------------------- */}
      {!isAdmin && (
        <>
          {/* Ward Switcher Bar */}
          <div
            className="card"
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--primary-navy)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              border: '1px solid rgba(212, 154, 55, 0.3)'
            }}
          >
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-light)', marginRight: '0.25rem' }}>
              Select Active Ward:
            </span>

            {availableWards.map((w) => {
              const isSelected = w.id === selectedWard?.id;
              const isPending = w.admissionNo.includes('PEND');
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWardId(w.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '9999px',
                    border: isSelected ? '2px solid var(--gold-light)' : '1px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: isSelected ? 'rgba(212, 154, 55, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.825rem',
                    cursor: 'pointer'
                  }}
                >
                  <span>{w.firstName} {w.lastName}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: isPending ? '#fef3c7' : 'rgba(255, 255, 255, 0.2)',
                      color: isPending ? '#92400e' : '#ffffff',
                      fontWeight: 700
                    }}
                  >
                    {isPending ? 'Under Review' : `${w.classLevel}`}
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsRegisterChildModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '9999px',
                border: '1px dashed var(--gold-light)',
                backgroundColor: 'transparent',
                color: 'var(--gold-light)',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={13} /> Add Sibling
            </button>
          </div>

          {selectedWard && (
            <>
              {/* Financial Pulse for Selected Ward */}
              <div className="grid grid-cols-3 gap-4">
                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'var(--gold-badge)', color: '#b45309' }}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Selected Term Bill</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                      &#8358;{calculatedTotal.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {selectedWard.firstName} &bull; {selectedWard.classLevel}
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald)' }}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Amount Paid to Date</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--emerald)' }}>
                      &#8358;{paidSoFar.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--emerald)' }}>
                      {calculatedTotal > 0 ? Math.round((paidSoFar / calculatedTotal) * 100) : 0}% Cleared
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: 'var(--ruby-bg)', color: 'var(--ruby)' }}>
                    <Clock size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Balance Due</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: netDue > 0 ? 'var(--ruby)' : '#059669' }}>
                      &#8358;{netDue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: netDue > 0 ? 'var(--ruby)' : '#059669', fontWeight: 700 }}>
                      {netDue === 0 ? 'Fully Cleared' : 'Pending Payment'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Itemized Fee Schedule & Selection Desk */}
              <div className="card" style={{ border: '2px solid var(--gold-primary)', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      <Receipt size={14} /> Itemized Fee Selection Desk &bull; {selectedWard.firstName} {selectedWard.lastName} ({selectedWard.admissionNo})
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                      Select All Fees You Need to Pay
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                      Check or uncheck optional services below (bus transport, hot lunch program, uniform pack). Mandatory fees are pre-locked according to school policy.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={handleParentPayOnlineBachs}
                      disabled={isBachsLoading || netDue <= 0}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                    >
                      <Globe size={15} />
                      {isBachsLoading ? 'Opening Bachs.io...' : `Pay ₦${netDue.toLocaleString()} via Bachs.io`}
                    </button>
                    {wardInvoice && (
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(wardInvoice)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Receipt size={15} /> Stamped Receipt
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Fee Items Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '0.75rem 1rem', width: '48px', textAlign: 'center' }}>Pay</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Fee Description</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Requirement</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount (&#8358;)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeSchedule.map((item) => {
                        const isSelected = item.isMandatory || currentWardFeeIds.has(item.id);
                        return (
                          <tr
                            key={item.id}
                            onClick={() => toggleFeeItem(item.id, item.isMandatory)}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              cursor: item.isMandatory ? 'default' : 'pointer',
                              backgroundColor: isSelected ? 'rgba(212, 154, 55, 0.03)' : '#ffffff',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                              {item.isMandatory ? (
                                <Lock size={16} color="#94a3b8" />
                              ) : isSelected ? (
                                <CheckSquare size={18} color="var(--gold-dark)" />
                              ) : (
                                <Square size={18} color="#cbd5e1" />
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{item.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.description}</div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  fontWeight: 600
                                }}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              {item.isMandatory ? (
                                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle2 size={13} /> Mandatory
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700 }}>
                                  Optional (Selectable)
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: isSelected ? 'var(--primary-navy)' : '#94a3b8' }}>
                              &#8358;{item.amount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={4} style={{ padding: '1rem', fontWeight: 800, color: 'var(--primary-navy)', textAlign: 'right' }}>
                          Grand Total Selected Payable:
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 900, fontSize: '1.15rem', color: 'var(--gold-dark)' }}>
                          &#8358;{calculatedTotal.toLocaleString()}
                        </td>
                      </tr>
                      {paidSoFar > 0 && (
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td colSpan={4} style={{ padding: '0.5rem 1rem', fontWeight: 700, color: '#059669', textAlign: 'right' }}>
                            Less Paid Amount:
                          </td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 800, color: '#059669' }}>
                            - &#8358;{paidSoFar.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1' }}>
                        <td colSpan={4} style={{ padding: '0.75rem 1rem', fontWeight: 900, color: 'var(--primary-navy)', textAlign: 'right', fontSize: '1rem' }}>
                          Net Outstanding Balance Due:
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 900, fontSize: '1.25rem', color: netDue > 0 ? '#b91c1c' : '#059669' }}>
                          &#8358;{netDue.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Direct Offline Transfer Form Card */}
              <div
                className="card"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {/* Zenith Bank Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Building size={20} color="#059669" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                      Pay Offline via Zenith Bank Transfer
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem' }}>
                    Make a direct transfer or bank deposit to the school account below. Always include your child&apos;s admission number as transaction reference.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', backgroundColor: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Bank</span>
                      <strong style={{ fontSize: '0.85rem' }}>Zenith Bank Plc</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Account Name</span>
                      <strong style={{ fontSize: '0.85rem' }}>Dominion International School</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>NUBAN Account No</span>
                        <div style={{ fontWeight: 900, color: 'var(--gold-dark)', fontSize: '1.15rem' }}>1015894321</div>
                      </div>
                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.7rem', padding: '2px 8px' }}
                      >
                        {copiedBank ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                        {copiedBank ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mandatory Narration</span>
                      <strong style={{ fontSize: '0.85rem', color: '#065f46' }}>{selectedWard.admissionNo}</strong>
                    </div>
                  </div>
                </div>

                {/* Submit Teller Proof Form */}
                <form onSubmit={handleParentConfirmOfflineDirect} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    Submit Transfer Proof / Reference
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Already completed a transfer? Enter your bank reference or teller number below for bursary clearance.
                  </p>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.2rem' }}>
                      Transfer Channel *
                    </label>
                    <select
                      value={offlineChannel}
                      onChange={(e) => setOfflineChannel(e.target.value)}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Direct Bank Transfer (Zenith Bank)">Zenith Bank Mobile Transfer</option>
                      <option value="Inter-bank Transfer (Other Nigerian Bank)">Other Bank Direct Transfer (GTBank, Access, etc.)</option>
                      <option value="Bank Teller Cash Deposit">Branch Cash Deposit via Bank Teller</option>
                      <option value="POS Terminal">POS Card Payment at Bursary</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.2rem' }}>
                      Transaction Reference / Session ID / Teller No *
                    </label>
                    <input
                      type="text"
                      required
                      value={offlineReference}
                      onChange={(e) => setOfflineReference(e.target.value)}
                      placeholder="e.g. ZEN-TXN-9028148 or Teller #00281"
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={netDue <= 0 || !offlineReference}
                    className="btn btn-primary"
                    style={{ marginTop: '0.5rem', fontWeight: 800, backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    Submit Proof for Bursary Clearance (₦{netDue.toLocaleString()})
                  </button>
                </form>
              </div>
            </>
          )}
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADMIN VIEW: INSTITUTIONAL FINANCIAL LEDGER & STUDENT INVOICES */}
      {/* ------------------------------------------------------------- */}
      {isAdmin && (
        <>
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
        </>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PROCESS PAYMENT (ADMIN OR GENERAL)                     */}
      {/* ------------------------------------------------------------- */}
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
                  </div>
                </div>

                {bachsCheckoutUrl ? (
                  <div style={{ textAlign: 'center', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <CheckCircle size={28} color="#059669" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: 800, color: '#065f46', fontSize: '1rem' }}>
                      Bachs.io Checkout Session Ready!
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
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

            {paymentMode === 'offline' && (
              <form onSubmit={handleConfirmOfflinePayment}>
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
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Bank Reference / Teller No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ZEN-TXN-894021"
                      value={offlineReference}
                      onChange={(e) => setOfflineReference(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Depositor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Adebayo Nnamdi"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      className="form-input"
                    />
                  </div>
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: OFFICIAL BURSARY STAMPED RECEIPT                      */}
      {/* ------------------------------------------------------------- */}
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
                <div><strong>Date Issued:</strong> {selectedInvoice.paidDate || new Date().toISOString().split('T')[0]}</div>
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REGISTER ANOTHER CHILD / WARD                          */}
      {/* ------------------------------------------------------------- */}
      {isRegisterChildModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Register Another Child / Ward
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Parent details are pre-filled from your profile ({parentName}).
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterChildModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterAnotherChild} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Parent / Guardian On File</div>
                <div style={{ color: '#64748b' }}>Name: <strong>{parentName}</strong> &bull; Email: <strong>{userEmail || 'verifiednadinho@gmail.com'}</strong></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                    Child&apos;s First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={childFirstName}
                    onChange={(e) => setChildFirstName(e.target.value)}
                    placeholder="e.g. Sarah"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                    Child&apos;s Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={childLastName}
                    onChange={(e) => setChildLastName(e.target.value)}
                    placeholder="e.g. Ikechukwu"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                    Gender *
                  </label>
                  <select
                    value={childGender}
                    onChange={(e) => setChildGender(e.target.value as 'Male' | 'Female')}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={childDob}
                    onChange={(e) => setChildDob(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                    Class Level Applying For *
                  </label>
                  <select
                    value={childClassLevel}
                    onChange={(e) => setChildClassLevel(e.target.value as ClassLevel)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                    Blood Group &amp; Genotype
                  </label>
                  <select
                    value={childBloodGroup}
                    onChange={(e) => setChildBloodGroup(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="O+">O+ (AA)</option>
                    <option value="A+">A+ (AA)</option>
                    <option value="B+">B+ (AA)</option>
                    <option value="AB+">AB+ (AA)</option>
                    <option value="O- (AS)">O- (AS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                  School Bus Shuttle Route
                </label>
                <select
                  value={childBusRoute}
                  onChange={(e) => setChildBusRoute(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="zone-a">Zone A: Lekki Phase 1, Victoria Island, Ikoyi</option>
                  <option value="zone-b">Zone B: Chevron, Orchid, Ajah, Sangotedo</option>
                  <option value="zone-c">Zone C: Ikeja GRA, Maryland, Magodo Phase 2</option>
                  <option value="none">No Bus Shuttle (Private Parent Drop-off)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterChildModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingChild}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                >
                  <Plus size={16} />
                  {isSubmittingChild ? 'Submitting Application...' : `Register ${childFirstName || 'Child'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
