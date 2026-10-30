'use client';

import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { useSchoolStore } from '../../lib/store';
import { Student } from '../../lib/types';
import { useUser } from '@clerk/nextjs';

export default function ParentView() {
  const { user } = useUser();
  const { students, grades, fees, busRoutes, teachers } = useSchoolStore();

  // Find enrolled students for ward switching
  const enrolledStudents = students.filter((s) => s.admissionStatus === 'Enrolled' || s.status === 'Active');
  const [selectedWardId, setSelectedWardId] = useState<string>(enrolledStudents[0]?.id || '');

  const selectedWard = enrolledStudents.find((s) => s.id === selectedWardId) || enrolledStudents[0];
  const parentName = user?.fullName || user?.firstName || selectedWard?.guardianName || 'Parent / Guardian';

  // Ward's Form Tutor
  const formTutor = teachers.find((t) => t.id === selectedWard?.assignedTeacherId);

  // Ward's Grades
  const wardGrades = selectedWard ? grades.filter((g) => g.studentId === selectedWard.id) : [];

  // Ward's Fee Invoice
  const wardFee = selectedWard ? fees.find((f) => f.studentId === selectedWard.id) : undefined;

  // Ward's Bus Route
  const wardBus = selectedWard ? busRoutes.find((b) => b.id === selectedWard.busRouteId) : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Parent Greeting Banner with Ward Switcher */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #1a365d 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(212, 154, 55, 0.2)'
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
              <Sparkles size={14} color="var(--gold-light)" /> Parent &amp; Guardian Portal &bull; Term 1, 2026/2027
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome, {parentName}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.925rem' }}>
              Monitoring academic growth, morning roll call, bus tracking, and bursary payments for your ward(s).
            </p>
          </div>

          {/* Multi-Child / Ward Selector */}
          {enrolledStudents.length > 1 && (
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.35rem' }}>
                Select Active Ward:
              </label>
              <select
                value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary-navy)',
                  color: '#ffffff',
                  border: '1px solid var(--gold-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {enrolledStudents.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.firstName} {std.lastName} ({std.classLevel} {std.arm})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {!selectedWard ? (
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
          <Users size={44} color="#64748b" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
            No Wards Linked to Your Account Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem' }}>
            When you complete the digital admission application and your ward is admitted by the school, their live attendance register, term grades, bus route tracking, and official report cards will appear directly in this portal.
          </p>
          <Link href="/admissions" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Open Online Admission Form &rarr;
          </Link>
        </div>
      ) : (
        <>
          {/* Ward Status Overview Cards */}
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {/* Ward Identity */}
        <div className="card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Ward Dossier
          </span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
            {selectedWard?.firstName} {selectedWard?.lastName}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
            {selectedWard?.classLevel} {selectedWard?.arm} Arm &bull; {selectedWard?.admissionNo}
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor:
                  selectedWard?.house === 'Emerald'
                    ? '#ecfdf5'
                    : selectedWard?.house === 'Sapphire'
                    ? '#eff6ff'
                    : selectedWard?.house === 'Ruby'
                    ? '#fff1f2'
                    : '#fefce8',
                color:
                  selectedWard?.house === 'Emerald'
                    ? '#065f46'
                    : selectedWard?.house === 'Sapphire'
                    ? '#1e40af'
                    : selectedWard?.house === 'Ruby'
                    ? '#9f1239'
                    : '#854d0e'
              }}
            >
              {selectedWard?.house} House
            </span>
          </div>
        </div>

        {/* Attendance Pulse */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Morning Roll Call
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
                Marked at 07:42 AM by Form Tutor
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: 600 }}>
            Term Attendance Rate: 98.4% (Punctual)
          </div>
        </div>

        {/* Bus Safety Pulse */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              School Bus Service
            </span>
            <Bus size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
            {wardBus ? wardBus.routeTitle : 'School Transport'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
            Driver: <strong>{wardBus?.driverName}</strong> ({wardBus?.driverPhone})
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.25rem' }}>
            Vehicle: {wardBus?.vehicleNo} &bull; Morning Window: 6:45 AM - 7:20 AM
          </div>
        </div>

        {/* Bursary Clearance */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Term Fee Clearance
            </span>
            <CreditCard size={18} color="#7c3aed" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '0.5rem' }}>
            &#8358;{wardFee?.balance.toLocaleString()} Due
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Total Invoiced: &#8358;{wardFee?.totalAmount.toLocaleString()} &bull; Paid: &#8358;{wardFee?.paidAmount.toLocaleString()}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: wardFee?.status === 'Paid' ? '#ecfdf5' : '#fef3c7',
                color: wardFee?.status === 'Paid' ? '#065f46' : '#92400e'
              }}
            >
              Status: {wardFee?.status}
            </span>
          </div>
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
              Breakdown of CA1 (20%), CA2 (20%), and Terminal Exam (60%) for {selectedWard?.firstName}.
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
          <div style={{ overflowX: 'auto' }}>
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Official Dominion International School Fee Payment Details
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Pay directly via electronic transfer or bank teller. Reference your child&apos;s Admission Number (<strong>{selectedWard?.admissionNo}</strong>) on the payment narrative.
            </p>
          </div>
          <Link href="/dashboard/finance" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            View Full Invoice &amp; Payment History <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Bank Name</span>
            <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>Guaranty Trust Bank (GTBank)</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Account Name</span>
            <div style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>Dominion Int&apos;l School Ltd</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>NUBAN Account No</span>
            <div style={{ fontWeight: 900, color: 'var(--gold-dark)', fontSize: '1.1rem' }}>0124892019</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Payment Reference</span>
            <div style={{ fontWeight: 800, color: '#1e293b' }}>{selectedWard?.admissionNo}</div>
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
            <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{formTutor?.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Form Tutor for {selectedWard?.classLevel} {selectedWard?.arm} &bull; {formTutor?.email}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a href={`tel:${formTutor?.phone}`} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <Phone size={14} /> Call Tutor ({formTutor?.phone})
            </a>
            <a href={`mailto:${formTutor?.email}`} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
              <Mail size={14} /> Send Email
            </a>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

