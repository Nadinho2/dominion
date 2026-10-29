'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Trophy,
  CalendarCheck,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  QrCode,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useSchoolStore } from '../../lib/store';

export default function StudentView() {
  const { students, grades } = useSchoolStore();

  // Active student defaults to Chioma Adeyemi (std-1)
  const [activeStudentId, setActiveStudentId] = useState<string>('std-1');
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const studentGrades = grades.filter((g) => g.studentId === activeStudent?.id);

  const TIMETABLE_TODAY = [
    { period: 'Registration', time: '07:45 - 08:15 AM', subject: 'Morning Assembly & Roll Call', room: 'Central Hall', teacher: 'Form Tutor' },
    { period: 'Period 1', time: '08:15 - 09:05 AM', subject: 'Mathematics (Cambridge CAIE)', room: 'Room 204', teacher: 'Mr. Olumide Adeleke' },
    { period: 'Period 2', time: '09:05 - 09:55 AM', subject: 'Physics Practical Lab', room: 'Science Lab B', teacher: 'Dr. Nwosu' },
    { period: 'Break', time: '09:55 - 10:30 AM', subject: 'Morning Tea & House Social', room: 'Cafeteria', teacher: 'Prefects' },
    { period: 'Period 3', time: '10:30 - 11:20 AM', subject: 'Robotics & AI Studio', room: 'STEM Innovation Hub', teacher: 'Engr. Dipo' },
    { period: 'Period 4', time: '11:20 - 12:10 PM', subject: 'English Language & Literature', room: 'Room 204', teacher: 'Mrs. Chidinma Eze' },
    { period: 'Period 5', time: '12:10 - 01:00 PM', subject: 'Chemistry Laboratory', room: 'Chemistry Lab', teacher: 'Mrs. Afolayan' },
    { period: 'Lunch', time: '01:00 - 02:00 PM', subject: 'Lunch & Library Study', room: 'Dining Hall', teacher: 'Supervisors' },
    { period: 'Period 6', time: '02:00 - 03:00 PM', subject: 'Inter-House Sports Practice', room: 'Sports Pavilion', teacher: 'Coach Williams' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Student House Crest Greeting Banner */}
      <div
        style={{
          background:
            activeStudent?.house === 'Emerald'
              ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)'
              : activeStudent?.house === 'Sapphire'
              ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
              : activeStudent?.house === 'Ruby'
              ? 'linear-gradient(135deg, #881337 0%, #4c0519 100%)'
              : 'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginBottom: '0.75rem'
              }}
            >
              <Trophy size={14} color="#ffd700" /> Proud Scholar of {activeStudent?.house} House
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome back, {activeStudent?.firstName}!
            </h1>
            <p style={{ color: '#e2e8f0', fontSize: '0.925rem' }}>
              {activeStudent?.classLevel} {activeStudent?.arm} Arm &bull; Admission No: <strong>{activeStudent?.admissionNo}</strong>
            </p>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
              Personal House Points Contributed: <strong style={{ color: '#ffd700' }}>45 Points</strong> (Inter-House Relay &amp; Robotics Win)
            </div>
          </div>

          {/* Student Switcher for testing */}
          <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#ffd700', marginBottom: '0.35rem' }}>
              Switch Student View:
            </label>
            <select
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#0f172a',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              {students
                .filter((s) => s.admissionStatus === 'Enrolled')
                .map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.firstName} {std.lastName} ({std.classLevel})
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Digital Student ID Card */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Today's Schedule */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--primary-navy)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Today&apos;s Class Schedule &amp; Timetable
              </h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Term 1 &bull; Day 4 (Thursday)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {TIMETABLE_TODAY.map((slot, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: slot.period.includes('Period 1') ? '#f0fdf4' : '#ffffff',
                  borderLeft: slot.period.includes('Period 1') ? '4px solid #10b981' : '1px solid #e2e8f0'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
                      {slot.time}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 700 }}>
                      {slot.period}
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-navy)', marginTop: '0.2rem' }}>
                    {slot.subject}
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
                  <div>{slot.room}</div>
                  <div style={{ fontWeight: 600, color: '#334155' }}>{slot.teacher}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Student Identity Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, var(--primary-navy) 0%, #0d213f 100%)',
            color: '#ffffff',
            border: '2px solid var(--gold-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.5rem',
            position: 'relative'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>Dominion International School</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)' }}>Official Student Identity Card</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold-light)' }}>2026/2027</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '74px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: 'var(--gold-light)'
                }}
              >
                {activeStudent?.firstName[0]}{activeStudent?.lastName[0]}
              </div>

              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  {activeStudent?.firstName} {activeStudent?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                  Admission: <strong style={{ color: 'var(--gold-light)' }}>{activeStudent?.admissionNo}</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Class: {activeStudent?.classLevel} {activeStudent?.arm}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  House: <strong style={{ color: '#ffffff' }}>{activeStudent?.house} House</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Blood Group: <strong style={{ color: '#ffffff' }}>{activeStudent?.bloodGroup}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold-light)', fontSize: '0.7rem', fontWeight: 700 }}>
              <QrCode size={16} /> Verified Active
            </div>
          </div>
        </div>
      </div>

      {/* My Continuous Assessment Grades */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              My Academic Assessment Scores &amp; Grades
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Official term scores for Cambridge CAIE and Nigerian WAEC curricula.
            </p>
          </div>
          <Link href="/dashboard/grades" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
            View Full Grade Dossier
          </Link>
        </div>

        {studentGrades.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Continuous assessment marks are currently being compiled by your subject teachers.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {studentGrades.map((g) => (
              <div
                key={g.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>{g.subjectCode}</span>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 900,
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: g.grade.startsWith('A') ? '#ecfdf5' : '#eff6ff',
                      color: g.grade.startsWith('A') ? '#047857' : '#1d4ed8'
                    }}
                  >
                    {g.grade}
                  </span>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary-navy)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                  {g.subjectName}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                  <span>CA1: {g.ca1}/20</span>
                  <span>CA2: {g.ca2}/20</span>
                  <span>Exam: {g.exam}/60</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.35rem' }}>
                  Total: {g.total}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

