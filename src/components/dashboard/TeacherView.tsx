'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserPlus,
  CalendarCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Undo2,
  Check,
  Sparkles
} from 'lucide-react';
import { useSchoolStore } from '../../lib/store';
import { Student, AttendanceRecord } from '../../lib/types';
import { useUser } from '@clerk/nextjs';

export default function TeacherView() {
  const { user } = useUser();
  const {
    students,
    teachers,
    claimStudent,
    releaseStudentToPool,
    recordAttendance,
    addGrade
  } = useSchoolStore();

  // Active Teacher Profile (Tied to real logged-in user or active selection)
  const [activeTeacherId, setActiveTeacherId] = useState<string>(teachers[0]?.id || 'current-user');
  const activeTeacher = teachers.find((t) => t.id === activeTeacherId);

  const teacherName = user?.fullName || activeTeacher?.name || 'Form Tutor';
  const teacherClass = activeTeacher?.assignedClass || 'SSS 2';
  const teacherArm = activeTeacher?.assignedArm || 'Emerald';
  const teacherId = activeTeacher?.id || user?.id || 'current-user';

  // 1. My Class Roster (Students claimed by this specific teacher)
  const myClassStudents = students.filter(
    (s) => (s.assignedTeacherId === teacherId || s.assignedTeacherId === activeTeacher?.id) && s.admissionStatus === 'Enrolled'
  );

  // 2. Unassigned Claim Pool (Students ready for class & NOT claimed by any teacher yet!)
  // IMPORTANT: When a student is claimed, they are excluded from here, so other teachers CANNOT see them!
  const unassignedPool = students.filter(
    (s) => s.admissionStatus === 'Ready for Class' && !s.assignedTeacherId
  );

  // Filter pool by teacher's class level (with option to see all)
  const [showAllGrades, setShowAllGrades] = useState(false);
  const filteredPool = showAllGrades
    ? unassignedPool
    : unassignedPool.filter((s) => s.classLevel === teacherClass);

  // Claim notification state
  const [claimNotification, setClaimNotification] = useState<string | null>(null);

  // Attendance state for today's roll call
  const [attendanceSheet, setAttendanceSheet] = useState<{
    [studentId: string]: 'Present' | 'Late' | 'Absent' | 'Excused';
  }>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const handleClaim = async (student: Student) => {
    await claimStudent(student.id, teacherId, teacherArm, teacherClass);
    setClaimNotification(
      `Successfully enrolled ${student.firstName} ${student.lastName} into ${teacherClass} ${teacherArm}! This student is now exclusively locked to your class.`
    );
    setTimeout(() => setClaimNotification(null), 5000);
  };

  const handleRelease = async (student: Student) => {
    if (confirm(`Release ${student.firstName} ${student.lastName} back to the unassigned admissions pool?`)) {
      await releaseStudentToPool(student.id);
      setClaimNotification(`Released ${student.firstName} back to the general admissions pool.`);
      setTimeout(() => setClaimNotification(null), 4000);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Late' | 'Absent' | 'Excused') => {
    setAttendanceSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const records: Omit<AttendanceRecord, 'id'>[] = myClassStudents.map((std) => ({
      studentId: std.id,
      date: today,
      status: attendanceSheet[std.id] || 'Present',
      remarks: 'Daily morning roll call'
    }));

    await recordAttendance(records);
    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Teacher Profile & Greeting Banner */}
      <div
        className="portal-banner"
        style={{
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #173868 100%)',
          color: '#ffffff',
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
              <Sparkles size={14} color="var(--gold-light)" /> Form Tutor Portal &bull; Academic Year 2026/2027
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Welcome, {teacherName}
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6 }}>
              Assigned Form Tutor: <strong style={{ color: '#ffffff' }}>{teacherClass} {teacherArm} Arm</strong> &bull; Staff ID: {activeTeacher?.staffNo || 'STAFF-VERIFIED'}
            </p>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Subjects Taught: {activeTeacher?.subjects?.length ? activeTeacher.subjects.join(', ') : 'Mathematics, STEM'}
            </div>
          </div>

          {teachers.length > 1 && (
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.35rem' }}>
                Assigned Staff Account:
              </label>
              <select
                value={activeTeacherId}
                onChange={(e) => setActiveTeacherId(e.target.value)}
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
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.id}>
                    {tch.name} ({tch.assignedClass || 'SSS'} {tch.assignedArm || 'Emerald'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {claimNotification && (
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={20} color="#059669" />
          <span>{claimNotification}</span>
        </div>
      )}

      {/* Roster & Pool Overview Grid */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Enrolled Students</span>
            <span style={{ padding: '0.4rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-sm)' }}>
              <UserCheck size={18} color="#2563eb" />
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary-navy)' }}>
            {myClassStudents.length} Students
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
            Exclusively enrolled into {teacherClass} {teacherArm} (No class size limit)
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Available to Claim</span>
            <span style={{ padding: '0.4rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
              <UserPlus size={18} color="#d97706" />
            </span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.5rem', color: '#d97706' }}>
            {filteredPool.length} Unassigned
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Approved by Admin with assigned Houses &bull; Ready for your class
          </div>
        </div>
      </div>

      {/* SECTION 1: Claim Students from Admission Pool (The Core Requirement) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} color="var(--primary-navy)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Claim Students from Registered Admissions Pool
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Pick students from registered accounts into your class. <strong>When you claim a student, they are immediately locked and hidden from all other teachers.</strong>
            </p>
          </div>

          <button
            onClick={() => setShowAllGrades(!showAllGrades)}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            {showAllGrades ? `Filter by My Grade (${teacherClass} Only)` : 'Show All Grade Levels'}
          </button>
        </div>

        {filteredPool.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>No Unassigned Students in this Pool</div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              All students have either been claimed by a teacher or are pending Admin House allocation.
            </div>
          </div>
        ) : (
          <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {filteredPool.map((std) => (
              <div
                key={std.id}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b' }}>
                        {std.admissionNo} &bull; {std.classLevel}
                      </span>
                      <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-navy)' }}>
                        {std.firstName} {std.lastName}
                      </h4>
                    </div>

                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          std.house === 'Emerald'
                            ? '#ecfdf5'
                            : std.house === 'Sapphire'
                            ? '#eff6ff'
                            : std.house === 'Ruby'
                            ? '#fff1f2'
                            : '#fefce8',
                        color:
                          std.house === 'Emerald'
                            ? '#065f46'
                            : std.house === 'Sapphire'
                            ? '#1e40af'
                            : std.house === 'Ruby'
                            ? '#9f1239'
                            : '#854d0e'
                      }}
                    >
                      {std.house} House
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Gender: <strong>{std.gender}</strong> &bull; Blood: {std.bloodGroup}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Guardian: {std.guardianName} ({std.guardianPhone})
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(std)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem' }}
                >
                  <UserPlus size={16} /> Claim to {teacherClass} {teacherArm}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: My Class Active Roster */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              My Class Roster: {teacherClass} {teacherArm} ({myClassStudents.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Students actively enrolled under your care. No class size limit.
            </p>
          </div>
        </div>

        {myClassStudents.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No students currently claimed in your class. Claim unassigned students above to build your class roster.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Admission No</th>
                  <th style={{ padding: '0.75rem' }}>Student Name</th>
                  <th style={{ padding: '0.75rem' }}>House</th>
                  <th style={{ padding: '0.75rem' }}>Gender</th>
                  <th style={{ padding: '0.75rem' }}>Guardian Phone</th>
                  <th style={{ padding: '0.75rem' }}>Emergency Blood</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {myClassStudents.map((std) => (
                  <tr key={std.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                      {std.admissionNo}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      {std.firstName} {std.lastName}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor:
                            std.house === 'Emerald'
                              ? '#ecfdf5'
                              : std.house === 'Sapphire'
                              ? '#eff6ff'
                              : std.house === 'Ruby'
                              ? '#fff1f2'
                              : '#fefce8',
                          color:
                            std.house === 'Emerald'
                              ? '#065f46'
                              : std.house === 'Sapphire'
                              ? '#1e40af'
                              : std.house === 'Ruby'
                              ? '#9f1239'
                              : '#854d0e'
                        }}
                      >
                        {std.house}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{std.gender}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{std.guardianPhone}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{std.bloodGroup}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRelease(std)}
                        className="btn btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#b91c1c', borderColor: '#fca5a5' }}
                        title="Release back to pool"
                      >
                        <Undo2 size={13} /> Release to Pool
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: Morning Roll Call (Quick Daily Attendance for Claimed Students) */}
      {myClassStudents.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={20} color="var(--primary-navy)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Morning Roll Call Register: {teacherClass} {teacherArm}
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mark daily presence for your claimed students. Defaults to Present.
              </p>
            </div>

            <button
              onClick={handleSaveAttendance}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <Check size={16} /> Save Today&apos;s Attendance
            </button>
          </div>

          {attendanceSaved && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              Attendance for {teacherClass} {teacherArm} successfully recorded to Supabase!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myClassStudents.map((std) => {
              const currentStatus = attendanceSheet[std.id] || 'Present';
              return (
                <div
                  key={std.id}
                  style={{
                    padding: '0.85rem 1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                      {std.firstName} {std.lastName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                      ({std.admissionNo})
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {(['Present', 'Late', 'Absent', 'Excused'] as const).map((stat) => {
                      const isSelected = currentStatus === stat;
                      let bg = '#f1f5f9';
                      let color = '#475569';
                      if (isSelected) {
                        if (stat === 'Present') {
                          bg = '#10b981';
                          color = '#ffffff';
                        } else if (stat === 'Late') {
                          bg = '#f59e0b';
                          color = '#ffffff';
                        } else if (stat === 'Absent') {
                          bg = '#ef4444';
                          color = '#ffffff';
                        } else {
                          bg = '#6366f1';
                          color = '#ffffff';
                        }
                      }
                      return (
                        <button
                          key={stat}
                          type="button"
                          onClick={() => handleAttendanceChange(std.id, stat)}
                          style={{
                            border: 'none',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: isSelected ? 800 : 500,
                            backgroundColor: bg,
                            color,
                            cursor: 'pointer'
                          }}
                        >
                          {stat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

