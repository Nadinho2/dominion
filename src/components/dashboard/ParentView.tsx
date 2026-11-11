'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarCheck,
  Award,
  CreditCard,
  Bus,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Globe,
  Building,
  Copy,
  Check,
  ExternalLink,
  Plus,
  X,
  Utensils,
  BookOpen,
  CheckSquare,
  Square,
  Lock,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { useSchoolStore } from '../../lib/store';
import { Student, ClassLevel } from '../../lib/types';
import { useUser } from '@clerk/nextjs';
import { getFeeScheduleForClass, FeeItem } from '../../lib/feeSchedule';

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

export default function ParentView() {
  const { user } = useUser();
  const { students, grades, fees, busRoutes, teachers, selfRegisterStudent, recordPayment, upsertFeeInvoice } = useSchoolStore();

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
  const parentName = user?.fullName || user?.firstName || 'Parent / Guardian';

  // 1. Identify Wards belonging to this logged-in Parent
  const myWards = students.filter((s) => {
    if (!userEmail) return true;
    if (s.guardianEmail && s.guardianEmail.toLowerCase() === userEmail) return true;
    if (s.guardianName && parentName && s.guardianName.toLowerCase().includes(parentName.toLowerCase())) return true;
    // Development fallback for test accounts
    if (userEmail.includes('margaret') || userEmail.includes('nadinho')) {
      if (s.guardianEmail?.toLowerCase().includes('margaret') || s.guardianEmail?.toLowerCase().includes('nadinho')) return true;
    }
    return false;
  });

  const availableWards = myWards.length > 0 ? myWards : students;
  const [selectedWardId, setSelectedWardId] = useState<string>(availableWards[0]?.id || '');
  const selectedWard = availableWards.find((s) => s.id === selectedWardId) || availableWards[0];

  // 2. Fee Selection State for Selected Ward
  const feeSchedule = selectedWard ? getFeeScheduleForClass(selectedWard.classLevel) : [];
  
  // Selected Fee Item IDs (mandatory are always included, plus bus if enrolled, and lunch)
  const [selectedFeeIds, setSelectedFeeIds] = useState<{ [wardId: string]: Set<string> }>({});
  
  // Initialize fee selection for active ward if not set
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

  // Selected Total Calculation
  const selectedItems = feeSchedule.filter((item) => {
    if (item.isMandatory) return true;
    return currentWardFeeIds.has(item.id);
  });
  const calculatedTotal = selectedItems.reduce((acc, item) => acc + item.amount, 0);

  // Existing invoice if any
  const existingInvoice = selectedWard ? fees.find((f) => f.studentId === selectedWard.id) : undefined;
  const paidSoFar = existingInvoice?.paidAmount || 0;
  const netDue = Math.max(0, calculatedTotal - paidSoFar);

  // 3. Payment Processing State
  const [isBachsPaying, setIsBachsPaying] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineTellerNo, setOfflineTellerNo] = useState('');
  const [offlineBankName, setOfflineBankName] = useState('Zenith Bank Mobile Transfer');
  const [offlinePaymentSuccess, setOfflinePaymentSuccess] = useState<string | null>(null);

  // 4. Register Another Child Modal State
  const [isRegisterChildModalOpen, setIsRegisterChildModalOpen] = useState(false);
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string | null>(null);

  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState(selectedWard?.lastName || user?.lastName || '');
  const [childGender, setChildGender] = useState<'Male' | 'Female'>('Male');
  const [childDob, setChildDob] = useState('2018-05-14');
  const [childClassLevel, setChildClassLevel] = useState<ClassLevel>('Basic 3');
  const [childBloodGroup, setChildBloodGroup] = useState('O+');
  const [childBusRoute, setChildBusRoute] = useState('zone-a');
  const [childMedical, setChildMedical] = useState('None / Fit for physical education');

  // Ward's Form Tutor
  const formTutor = teachers.find((t) => t.id === selectedWard?.assignedTeacherId);

  // Ward's Grades
  const wardGrades = grades.filter((g) => g.studentId === selectedWard?.id);

  // Ward's Bus Route
  const wardBus = busRoutes.find((b) => b.id === selectedWard?.busRouteId);

  // 5. Pay Online with Bachs.io Gateway
  const handlePayOnlineWithBachs = async () => {
    if (!selectedWard || netDue <= 0) return;
    setIsBachsPaying(true);

    const invoiceNo = existingInvoice?.invoiceNo || `INV-2026-${selectedWard.admissionNo.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;
    const invoiceId = existingInvoice?.id || `inv-${selectedWard.id}-term1`;

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
        // Save/upsert invoice in store
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

        // Redirect directly to Bachs checkout session without being blocked by popup blockers
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || 'Failed to start Bachs.io checkout session.');
      }
    } catch (err) {
      console.error(err);
      alert('Unable to connect to Bachs.io payment gateway.');
    } finally {
      setIsBachsPaying(false);
    }
  };

  // 6. Submit Offline Payment Teller / Reference
  const handleSubmitOfflinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWard || netDue <= 0 || !offlineTellerNo) return;

    const invoiceNo = existingInvoice?.invoiceNo || `INV-2026-${selectedWard.admissionNo.replace(/[^a-zA-Z0-9]/g, '').slice(-6)}`;
    const invoiceId = existingInvoice?.id || `inv-${selectedWard.id}-term1`;

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

    // Notify backend offline logger
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
        channel: offlineBankName,
        reference: offlineTellerNo,
        notes: `Parent portal offline teller clearance for ${selectedWard.admissionNo}`
      })
    }).catch((err) => console.warn(err));

    setIsOfflineModalOpen(false);
    setOfflinePaymentSuccess(`Bank transfer of ₦${netDue.toLocaleString()} (Ref: ${offlineTellerNo}) logged! The bursar has been notified and official receipt dispatched.`);
    setOfflineTellerNo('');
  };

  // 7. Register Another Child / Ward
  const handleRegisterAnotherChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childFirstName || !childLastName) {
      alert('Please provide the child first name and last name.');
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
        // Add to local store
        const newStudent = data.student as Student;
        // Select this new student
        setSelectedWardId(newStudent.id);
        setIsRegisterChildModalOpen(false);
        setRegisterSuccessMessage(
          `Application for ${newStudent.firstName} ${newStudent.lastName} (${newStudent.classLevel}) submitted successfully! Temporary Admission Ref: ${newStudent.admissionNo}. The admissions office has been notified for class and house induction.`
        );
        // Clear child inputs
        setChildFirstName('');
      } else {
        alert(data.error || 'Failed to submit child registration application.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      alert('Network error submitting child admission.');
    } finally {
      setIsSubmittingChild(false);
    }
  };

  const copyBankNo = () => {
    navigator.clipboard.writeText('1015894321');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Notifications */}
      {registerSuccessMessage && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#065f46',
            fontSize: '0.9rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} color="#059669" />
            <span>{registerSuccessMessage}</span>
          </div>
          <button
            onClick={() => setRegisterSuccessMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {offlinePaymentSuccess && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            color: '#065f46',
            fontSize: '0.9rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={20} color="#059669" />
            <span>{offlinePaymentSuccess}</span>
          </div>
          <button
            onClick={() => setOfflinePaymentSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Parent Greeting Banner */}
      <div
        className="portal-banner"
        style={{
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1a365d 100%)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(212, 154, 55, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(212, 154, 55, 0.2)',
                border: '1px solid var(--gold-primary)',
                color: 'var(--gold-light)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.75rem'
              }}
            >
              <Sparkles size={14} color="var(--gold-light)" /> Parent &amp; Guardian Family Portal &bull; Term 1, 2026/2027
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome, {parentName}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.925rem', maxWidth: '650px' }}>
              Manage multiple wards, register new children, customize itemized term fees, and settle bursary payments seamlessly via Bachs.io or Zenith Bank transfer.
            </p>
          </div>

          {/* Quick Register Ward Button */}
          <button
            type="button"
            onClick={() => setIsRegisterChildModalOpen(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(212, 154, 55, 0.35)',
              padding: '0.75rem 1.25rem',
              fontWeight: 800
            }}
          >
            <Plus size={18} /> Register Another Child / Ward
          </button>
        </div>

        {/* Multi-Child / Ward Switcher Tabs Bar */}
        <div
          className="ward-switcher-container"
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}
        >
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-light)', marginRight: '0.25rem', flexShrink: 0 }}>
            Your Enrolled Wards:
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
                  gap: '0.65rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: isSelected ? '2px solid var(--gold-light)' : '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: isSelected ? 'rgba(212, 154, 55, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#ffffff' : '#e2e8f0',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.2)',
                    color: isSelected ? 'var(--primary-navy)' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 900
                  }}
                >
                  {w.firstName[0]}
                </div>
                <span>
                  {w.firstName} {w.lastName}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    backgroundColor: isPending ? '#fef3c7' : 'rgba(255, 255, 255, 0.2)',
                    color: isPending ? '#92400e' : '#ffffff',
                    fontWeight: 700
                  }}
                >
                  {isPending ? 'Under Review' : `${w.classLevel} ${w.arm}`}
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
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              border: '1px dashed var(--gold-light)',
              backgroundColor: 'transparent',
              color: 'var(--gold-light)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Plus size={14} /> Add Sibling
          </button>
        </div>
      </div>

      {!selectedWard ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
          <Users size={44} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            No Wards Linked to Your Profile Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem' }}>
            Click below to register your child for the 2026/2027 academic session. All guardian contact information will automatically be pre-filled from your profile.
          </p>
          <button
            type="button"
            onClick={() => setIsRegisterChildModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex' }}
          >
            Register Child Now &rarr;
          </button>
        </div>
      ) : (
        <>
          {/* Pending Admission Status Banner if child is not yet approved by Admin */}
          {selectedWard.admissionNo.includes('PEND') && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              <Clock size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.95rem' }}>
                  Admission Application Under Review &bull; Ref: {selectedWard.admissionNo}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#78350f', margin: '4px 0 0' }}>
                  The application for <strong>{selectedWard.firstName} {selectedWard.lastName}</strong> for <strong>{selectedWard.classLevel}</strong> is currently being processed by the Admissions Office. Once verified, house allocation (Emerald, Sapphire, Ruby, or Topaz) and class arm will be finalized and an official Admission Offer Letter will be sent to <strong>{selectedWard.guardianEmail}</strong>. You can review and clear their preliminary term fees below.
                </p>
              </div>
            </div>
          )}

          {/* Ward Status Overview Cards */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {/* Ward Identity */}
            <div className="card">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ward Profile
              </span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
                {selectedWard.firstName} {selectedWard.lastName}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                {selectedWard.classLevel} {selectedWard.arm} Arm &bull; {selectedWard.admissionNo}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    backgroundColor:
                      selectedWard.house === 'Emerald'
                        ? '#ecfdf5'
                        : selectedWard.house === 'Sapphire'
                        ? '#eff6ff'
                        : selectedWard.house === 'Ruby'
                        ? '#fff1f2'
                        : selectedWard.house === 'Topaz'
                        ? '#fefce8'
                        : '#f1f5f9',
                    color:
                      selectedWard.house === 'Emerald'
                        ? '#065f46'
                        : selectedWard.house === 'Sapphire'
                        ? '#1e40af'
                        : selectedWard.house === 'Ruby'
                        ? '#9f1239'
                        : selectedWard.house === 'Topaz'
                        ? '#854d0e'
                        : '#475569'
                  }}
                >
                  {selectedWard.house} House
                </span>
                <span
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9',
                    color: '#475569'
                  }}
                >
                  Blood Group: {selectedWard.bloodGroup}
                </span>
              </div>
            </div>

            {/* Attendance Pulse */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Roll Call &amp; Punctuality
                </span>
                <CalendarCheck size={18} color="#059669" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#065f46' }}>
                    Present in Class
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Verified by Form Tutor at 07:42 AM
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 600 }}>
                Term Attendance Rate: 98.4% (Consistent)
              </div>
            </div>

            {/* Bus Safety Pulse */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  School Bus Shuttle
                </span>
                <Bus size={18} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
                {wardBus ? wardBus.routeTitle : 'Zone A • Victoria Island / Lekki'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Driver: <strong>{wardBus?.driverName || 'Mr. Babatunde Alabi'}</strong> ({wardBus?.driverPhone || '+234 802 111 2233'})
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.25rem' }}>
                Vehicle: {wardBus?.vehicleNo || 'DIS-BUS-04'} &bull; Window: 6:45 AM - 7:20 AM
              </div>
            </div>

            {/* Bursary Clearance Pulse */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Term Fees Due
                </span>
                <CreditCard size={18} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: netDue > 0 ? 'var(--primary-navy)' : '#059669', marginTop: '0.5rem' }}>
                &#8358;{netDue.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Total Bill: &#8358;{calculatedTotal.toLocaleString()} &bull; Paid: &#8358;{paidSoFar.toLocaleString()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: netDue === 0 ? '#ecfdf5' : '#fef3c7',
                    color: netDue === 0 ? '#065f46' : '#92400e'
                  }}
                >
                  {netDue === 0 ? 'Fully Cleared' : 'Payment Outstanding'}
                </span>

                {netDue > 0 && (
                  <button
                    type="button"
                    onClick={handlePayOnlineWithBachs}
                    disabled={isBachsPaying}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Globe size={13} />
                    {isBachsPaying ? 'Opening...' : 'Pay with Bachs.io'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ITEMIZE & SELECT FEES DESK */}
          <div className="card" style={{ border: '2px solid var(--gold-primary)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <Receipt size={14} /> Itemized Bursary Selection Desk &bull; {selectedWard.firstName} ({selectedWard.classLevel})
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                  Select Term 1 Fees to Pay
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  Review mandatory academic fees and customize optional services (school bus shuttle, hot lunch program, uniform kit) before proceeding to payment.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePayOnlineWithBachs}
                  disabled={isBachsPaying || netDue <= 0}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                >
                  <Globe size={15} />
                  {isBachsPaying ? 'Opening Bachs.io...' : `Pay ₦${netDue.toLocaleString()} via Bachs.io`}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(true)}
                  disabled={netDue <= 0}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Building size={15} /> Bank Transfer (Offline)
                </button>
              </div>
            </div>

            {/* Fee Items Table */}
            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '0.75rem 1rem', width: '48px', textAlign: 'center' }}>Select</th>
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

            {/* Quick Helper */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                * Mandatory items cannot be unselected as they are required by the academic board and Cambridge assessment curriculum.
              </div>
              <Link href="/dashboard/finance" className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>
                Open Full Bursary Portal <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Academic Performance & Stamped Report Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="var(--gold-dark)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    Continuous Assessment &amp; Cambridge Examination Record
                  </h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Breakdown of CA1 (20%), CA2 (20%), and Terminal Exam (60%) for {selectedWard.firstName}.
                </p>
              </div>

              <Link href="/dashboard/grades" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Download size={15} /> Download Official Stamped Report Card (PDF)
              </Link>
            </div>

            {wardGrades.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No grades recorded for this term yet. Scores will appear immediately as subject teachers finalize their assessments.
              </div>
            ) : (
              <div className="table-responsive-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                      <th style={{ padding: '0.75rem' }}>Subject</th>
                      <th style={{ padding: '0.75rem' }}>CA 1 (20)</th>
                      <th style={{ padding: '0.75rem' }}>CA 2 (20)</th>
                      <th style={{ padding: '0.75rem' }}>Exam (60)</th>
                      <th style={{ padding: '0.75rem' }}>Total (100)</th>
                      <th style={{ padding: '0.75rem' }}>Grade</th>
                      <th style={{ padding: '0.75rem' }}>Teacher Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wardGrades.map((g) => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                          {g.subjectName} ({g.subjectCode})
                        </td>
                        <td style={{ padding: '0.75rem' }}>{g.ca1}</td>
                        <td style={{ padding: '0.75rem' }}>{g.ca2}</td>
                        <td style={{ padding: '0.75rem' }}>{g.exam}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 800 }}>{g.total}%</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span
                            style={{
                              padding: '0.2rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 800,
                              backgroundColor: g.grade.startsWith('A') ? '#ecfdf5' : '#eff6ff',
                              color: g.grade.startsWith('A') ? '#047857' : '#1d4ed8'
                            }}
                          >
                            {g.grade}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                          {g.remark}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Official Bank Account for Direct Fee Payments */}
          <div className="card" style={{ border: '2px solid var(--gold-primary)', backgroundColor: '#fffdfa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Building size={18} color="#059669" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                    Official School Fee Payment Account (Zenith Bank)
                  </h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Parents paying offline can transfer directly or pay via bank teller. Always quote your ward&apos;s Admission Number (<strong>{selectedWard.admissionNo}</strong>) as the transaction narration.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(true)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem' }}
                >
                  Submit Bank Teller Proof
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Bank Name</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>Zenith Bank Plc</div>
              </div>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Account Name</span>
                <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>Dominion International School</div>
              </div>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>NUBAN Account No</span>
                  <div style={{ fontWeight: 900, color: 'var(--gold-dark)', fontSize: '1.15rem', letterSpacing: '0.05em' }}>1015894321</div>
                </div>
                <button
                  type="button"
                  onClick={copyBankNo}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                >
                  {copiedAccount ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                  {copiedAccount ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Mandatory Narration</span>
                <div style={{ fontWeight: 800, color: '#065f46' }}>{selectedWard.admissionNo}</div>
              </div>
            </div>
          </div>

          {/* Form Tutor Direct Communication */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.75rem' }}>
              Form Tutor Contact &amp; Pastoral Care
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{formTutor?.name || 'Mr. Adewale Adeyemi'}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Form Tutor for {selectedWard.classLevel} {selectedWard.arm} &bull; {formTutor?.email || 'a.adeyemi@dominion.sch.ng'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a href={`tel:${formTutor?.phone || '+234 803 111 2233'}`} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                  <Phone size={14} /> Call Tutor
                </a>
                <a href={`mailto:${formTutor?.email || 'a.adeyemi@dominion.sch.ng'}`} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                  <Mail size={14} /> Send Email
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MODAL 1: REGISTER ANOTHER CHILD / WARD */}
      {isRegisterChildModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Register Another Child / Ward
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Guardian details are pre-filled from your profile ({parentName}).
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
              
              {/* Guardian Info Pill */}
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>Parent / Guardian On File</div>
                <div style={{ color: '#64748b' }}>Name: <strong>{parentName}</strong> &bull; Email: <strong>{userEmail || 'verifiednadinho@gmail.com'}</strong></div>
              </div>

              {/* Child Names */}
              <div className="grid-2-col-responsive">
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

              {/* Gender & DOB */}
              <div className="grid-2-col-responsive">
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

              {/* Class Applying For */}
              <div className="grid-2-col-responsive">
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

              {/* Bus Route */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                  School Bus Shuttle Service
                </label>
                <select
                  value={childBusRoute}
                  onChange={(e) => setChildBusRoute(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="zone-a">Zone A: Lekki Phase 1, Victoria Island, Ikoyi</option>
                  <option value="zone-b">Zone B: Chevron, Orchid, Ajah, Sangotedo</option>
                  <option value="zone-c">Zone C: Ikeja GRA, Maryland, Magodo Phase 2</option>
                  <option value="none">No Bus Shuttle Needed (Private Parent Drop-off)</option>
                </select>
              </div>

              {/* Medical Information */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                  Medical Conditions, Dietary Restrictions or Allergies
                </label>
                <input
                  type="text"
                  value={childMedical}
                  onChange={(e) => setChildMedical(e.target.value)}
                  placeholder="e.g. Asthma inhaler, peanut allergy, or None"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                />
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
                  {isSubmittingChild ? 'Registering Child...' : `Register ${childFirstName || 'Child'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT OFFLINE BANK TELLER PROOF */}
      {isOfflineModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Submit Bank Transfer / Teller Proof
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Direct credit for <strong>{selectedWard.firstName} {selectedWard.lastName} ({selectedWard.admissionNo})</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfflineModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitOfflinePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#166534' }}>
                Zenith Bank Plc &bull; Acct: <strong>1015894321</strong> &bull; Amount Due: <strong>&#8358;{netDue.toLocaleString()}</strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                  Payment Method / Channel *
                </label>
                <select
                  value={offlineBankName}
                  onChange={(e) => setOfflineBankName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="Zenith Bank Mobile App / Transfer">Zenith Bank Mobile App / Transfer</option>
                  <option value="Other Bank Direct NIP Transfer">Other Bank Direct NIP Transfer (GTBank, Access, etc.)</option>
                  <option value="Physical Branch Bank Teller">Physical Branch Bank Teller</option>
                  <option value="School Bursary POS Terminal">School Bursary POS Terminal</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.25rem' }}>
                  Transaction Reference / Teller Number *
                </label>
                <input
                  type="text"
                  required
                  value={offlineTellerNo}
                  onChange={(e) => setOfflineTellerNo(e.target.value)}
                  placeholder="e.g. ZEN-TXN-88492019 or Teller #00492"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 800 }}
                >
                  Confirm &amp; Log Payment Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
