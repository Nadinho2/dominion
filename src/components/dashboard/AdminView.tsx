'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Trophy,
  ArrowUpRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Bus,
  BookOpen,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  ChevronRight
} from 'lucide-react';
import { useSchoolStore } from '../../lib/store';
import { HouseColor, ClassLevel, ClassArm, BusRoute, Subject, FeeInvoice } from '../../lib/types';

export default function AdminView() {
  const {
    students,
    teachers,
    subjects,
    fees,
    busRoutes,
    announcements,
    assignHouseAndApprove,
    assignTeacher,
    addBusRoute,
    updateBusRoute,
    deleteBusRoute,
    addSubject,
    deleteSubject,
    addFeeInvoice
  } = useSchoolStore();

  const [activeTab, setActiveTab] = useState<'admissions' | 'teachers' | 'transport' | 'curriculum' | 'fees'>('admissions');

  // Admissions State
  const [selectedHouse, setSelectedHouse] = useState<{ [studentId: string]: HouseColor }>({});
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);

  // Teacher Assignment Modal
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [assignedClassInput, setAssignedClassInput] = useState<ClassLevel>('SSS 2');
  const [assignedArmInput, setAssignedArmInput] = useState<ClassArm>('Emerald');
  const [teacherSubjectsInput, setTeacherSubjectsInput] = useState<string>('');

  // Bus Route Modal
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteData, setNewRouteData] = useState<Omit<BusRoute, 'id'>>({
    zone: 'Zone D',
    routeTitle: 'Ikeja GRA - Allen Avenue - Opebi Axis',
    driverName: 'Mr. Sunday Adebisi',
    driverPhone: '+234 803 777 8899',
    vehicleNo: 'APP-102-LA (Toyota Coaster)',
    capacity: 30,
    registeredStudents: 0,
    fee: 95000,
    status: 'Active',
    stops: ['Ikeja Underbridge', 'Allen Junction', 'Opebi Roundabout', 'Airport Rd']
  });

  // Subject Modal
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectData, setNewSubjectData] = useState<Omit<Subject, 'id'>>({
    name: 'Data Science & Artificial Intelligence',
    code: 'DAT201',
    category: 'Sciences',
    curriculum: 'Cambridge'
  });

  // KPI Calculations
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const pendingApplicants = students.filter((s) => s.admissionStatus === 'Pending Review');
  const readyForClassStudents = students.filter((s) => s.admissionStatus === 'Ready for Class' && !s.assignedTeacherId);
  const totalFeesExpected = fees.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalFeesPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const collectionRate = totalFeesExpected > 0 ? Math.round((totalFeesPaid / totalFeesExpected) * 100) : 0;

  // Inter-house points
  const housePoints = {
    Emerald: 420,
    Sapphire: 395,
    Ruby: 370,
    Topaz: 350
  };

  const handleApproveStudent = async (studentId: string) => {
    const house = selectedHouse[studentId] || 'Emerald';
    await assignHouseAndApprove(studentId, house);
    setApprovalSuccess(`Successfully assigned to ${house} House and released to Teacher Claim Pool!`);
    setTimeout(() => setApprovalSuccess(null), 4000);
  };

  const handleSaveTeacherAllocation = async () => {
    if (!editingTeacherId) return;
    const subs = teacherSubjectsInput.split(',').map((s) => s.trim()).filter(Boolean);
    await assignTeacher(editingTeacherId, assignedClassInput, assignedArmInput, subs);
    setEditingTeacherId(null);
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBusRoute(newRouteData);
    setShowAddRouteModal(false);
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSubject(newSubjectData);
    setShowAddSubjectModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Executive Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary-navy) 0%, #0f274a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(212, 154, 55, 0.2)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
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
            Dominion Through Excellence &bull; Plot 14/16 Airport Road, Ajao Estate
          </div>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Principal &amp; Administrator Command Center
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6 }}>
            Institutional governance portal for British-Nigerian curriculum operations, Cambridge framework tracking,
            inter-house allocations, teacher class deployment, and bursary accounting.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('admissions')}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <UserCheck size={16} /> House Allocation Desk ({pendingApplicants.length} Pending)
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className="btn btn-outline"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '0.85rem' }}
            >
              <GraduationCap size={16} /> Teacher Deployment ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className="btn btn-outline"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '0.85rem' }}
            >
              <Bus size={16} /> Bus Fleet ({busRoutes.length} Routes)
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className="btn btn-outline"
              style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', fontSize: '0.85rem' }}
            >
              <BookOpen size={16} /> Curriculum &amp; Subjects ({subjects.length})
            </button>
          </div>
        </div>
      </div>

      {approvalSuccess && (
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
          <span>{approvalSuccess}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Enrolled</span>
            <span style={{ padding: '0.4rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-sm)' }}>
              <Users size={18} color="#2563eb" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary-navy)' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
            {activeStudents} actively enrolled in classes
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending House Review</span>
            <span style={{ padding: '0.4rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
              <ShieldAlert size={18} color="#d97706" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: '#d97706' }}>
            {pendingApplicants.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Self-registered online applicants
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ready for Teacher Pick</span>
            <span style={{ padding: '0.4rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)' }}>
              <UserCheck size={18} color="#059669" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: '#059669' }}>
            {readyForClassStudents.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            In teacher claim pools
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fee Recovery Rate</span>
            <span style={{ padding: '0.4rem', backgroundColor: '#f5f3ff', borderRadius: 'var(--radius-sm)' }}>
              <CreditCard size={18} color="#7c3aed" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--primary-navy)' }}>
            {collectionRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            &#8358;{totalFeesPaid.toLocaleString()} collected
          </div>
        </div>
      </div>

      {/* House Championship Mini-Widget */}
      <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} color="var(--gold-primary)" />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
              Official Inter-House League Championship Standings
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2026/2027 Track &amp; Field Season</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>🟢 Emerald House (1st Place)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857' }}>{housePoints.Emerald} pts</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', border: '1px solid #3b82f6' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>🔵 Sapphire House (2nd Place)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1d4ed8' }}>{housePoints.Sapphire} pts</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fff1f2', border: '1px solid #f43f5e' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9f1239' }}>🔴 Ruby House (3rd Place)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#be123c' }}>{housePoints.Ruby} pts</div>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fefce8', border: '1px solid #eab308' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#854d0e' }}>🟡 Topaz House (4th Place)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#a16207' }}>{housePoints.Topaz} pts</div>
          </div>
        </div>
      </div>

      {/* Operations Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('admissions')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.925rem',
            cursor: 'pointer',
            color: activeTab === 'admissions' ? 'var(--primary-navy)' : '#64748b',
            borderBottom: activeTab === 'admissions' ? '3px solid var(--gold-primary)' : '3px solid transparent'
          }}
        >
          1. House Allocation &amp; Admission Desk ({pendingApplicants.length})
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.925rem',
            cursor: 'pointer',
            color: activeTab === 'teachers' ? 'var(--primary-navy)' : '#64748b',
            borderBottom: activeTab === 'teachers' ? '3px solid var(--gold-primary)' : '3px solid transparent'
          }}
        >
          2. Teacher Class Allocations
        </button>
        <button
          onClick={() => setActiveTab('transport')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.925rem',
            cursor: 'pointer',
            color: activeTab === 'transport' ? 'var(--primary-navy)' : '#64748b',
            borderBottom: activeTab === 'transport' ? '3px solid var(--gold-primary)' : '3px solid transparent'
          }}
        >
          3. Bus Routes &amp; Fleet
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.925rem',
            cursor: 'pointer',
            color: activeTab === 'curriculum' ? 'var(--primary-navy)' : '#64748b',
            borderBottom: activeTab === 'curriculum' ? '3px solid var(--gold-primary)' : '3px solid transparent'
          }}
        >
          4. Curriculum &amp; Subjects
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          style={{
            padding: '0.75rem 0.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '0.925rem',
            cursor: 'pointer',
            color: activeTab === 'fees' ? 'var(--primary-navy)' : '#64748b',
            borderBottom: activeTab === 'fees' ? '3px solid var(--gold-primary)' : '3px solid transparent'
          }}
        >
          5. Fee Schedules
        </button>
      </div>

      {/* TAB 1: House Allocation & Admission Desk */}
      {activeTab === 'admissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  Self-Registered Student Intake Desk
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Review applicants who registered online. Assign their official House and approve their Admission Number to release them to the Teacher Claim Pool.
                </p>
              </div>
              <Link href="/admissions" className="btn btn-outline" style={{ fontSize: '0.8rem' }} target="_blank">
                + Open Public Admission Form <ArrowUpRight size={14} />
              </Link>
            </div>

            {pendingApplicants.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>All Applicant Reviews Up to Date</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  No pending self-registered applicants. New applications submitted online will show up here automatically.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingApplicants.map((applicant) => {
                  const currentHousePick = selectedHouse[applicant.id] || 'Emerald';
                  return (
                    <div
                      key={applicant.id}
                      style={{
                        padding: '1.25rem',
                        border: '1px solid #fed7aa',
                        backgroundColor: '#fffbeb',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.5rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                            {applicant.firstName} {applicant.lastName}
                          </span>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#e2e8f0', color: '#475569', fontWeight: 600 }}>
                            {applicant.gender} &bull; {applicant.dob}
                          </span>
                          <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 700 }}>
                            Target Class: {applicant.classLevel}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                          Guardian: <strong style={{ color: '#334155' }}>{applicant.guardianName}</strong> ({applicant.guardianPhone}) &bull; {applicant.guardianEmail}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Registered on: {applicant.joinedDate} &bull; Temp Ref: {applicant.admissionNo}
                        </div>
                      </div>

                      {/* House Selector & Action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                            Assign House:
                          </label>
                          <select
                            value={currentHousePick}
                            onChange={(e) => setSelectedHouse({ ...selectedHouse, [applicant.id]: e.target.value as HouseColor })}
                            style={{
                              padding: '0.45rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              backgroundColor: '#ffffff'
                            }}
                          >
                            <option value="Emerald">🟢 Emerald House</option>
                            <option value="Sapphire">🔵 Sapphire House</option>
                            <option value="Ruby">🔴 Ruby House</option>
                            <option value="Topaz">🟡 Topaz House</option>
                          </select>
                        </div>

                        <button
                          onClick={() => handleApproveStudent(applicant.id)}
                          className="btn btn-primary"
                          style={{ alignSelf: 'flex-end', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                        >
                          <Check size={16} /> Assign House &amp; Release to Teachers
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Currently In Teacher Claim Pool */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
              Students Ready for Class Assignment ({readyForClassStudents.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              These students have been assigned Houses and Admission Numbers. They are currently visible in the Form Tutor Claim Pool for teachers to pick into their class arms.
            </p>

          {readyForClassStudents.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              No students currently waiting in the claim pool. Approved applicants will appear here for teachers to claim.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '0.75rem' }}>Admission No</th>
                    <th style={{ padding: '0.75rem' }}>Student Name</th>
                    <th style={{ padding: '0.75rem' }}>Class Level</th>
                    <th style={{ padding: '0.75rem' }}>Assigned House</th>
                    <th style={{ padding: '0.75rem' }}>Guardian Contact</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {readyForClassStudents.map((std) => (
                    <tr key={std.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{std.admissionNo}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{std.firstName} {std.lastName}</td>
                      <td style={{ padding: '0.75rem' }}>{std.classLevel}</td>
                      <td style={{ padding: '0.75rem' }}>
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
                      </td>
                      <td style={{ padding: '0.75rem', color: '#64748b' }}>{std.guardianPhone}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                          Available in Teacher Pool
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}

      {/* TAB 2: Teacher Allocations */}
      {activeTab === 'teachers' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Teacher Staff Allocation &amp; Form Tutor Deployment
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Assign teachers to class levels and class arms. Teachers assigned as Form Tutors can claim students and take morning roll call.
              </p>
            </div>
          </div>

          {teachers.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <Users size={36} color="#64748b" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>No Teachers Registered Yet</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Academic staff members registered with the teacher role will appear here for class and subject deployment.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  style={{
                    padding: '1.25rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                        {teacher.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                        {teacher.staffNo}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '0.25rem' }}>
                      {teacher.qualification} &bull; {teacher.email} &bull; {teacher.phone}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                        Form Tutor: {teacher.assignedClass || 'Unassigned'} {teacher.assignedArm || ''}
                      </span>
                      {teacher.subjects.map((sub, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingTeacherId(teacher.id);
                      setAssignedClassInput(teacher.assignedClass || 'SSS 2');
                      setAssignedArmInput(teacher.assignedArm || 'Emerald');
                      setTeacherSubjectsInput(teacher.subjects.join(', '));
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    <Edit2 size={14} /> Reassign Class &amp; Subjects
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Teacher Reassignment Drawer/Modal */}
          {editingTeacherId && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                border: '2px solid var(--gold-primary)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc'
              }}
            >
              <h4 style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                Update Class &amp; Subject Allocation for Teacher
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Assigned Class Level:
                  </label>
                  <select
                    value={assignedClassInput}
                    onChange={(e) => setAssignedClassInput(e.target.value as ClassLevel)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="SSS 3">SSS 3</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="Basic 5">Basic 5</option>
                    <option value="Basic 4">Basic 4</option>
                    <option value="Basic 3">Basic 3</option>
                    <option value="Basic 2">Basic 2</option>
                    <option value="Basic 1">Basic 1</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Assigned Class Arm:
                  </label>
                  <select
                    value={assignedArmInput}
                    onChange={(e) => setAssignedArmInput(e.target.value as ClassArm)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Emerald">Emerald Arm</option>
                    <option value="Diamond">Diamond Arm</option>
                    <option value="Gold">Gold Arm</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Subjects (comma separated):
                  </label>
                  <input
                    type="text"
                    value={teacherSubjectsInput}
                    onChange={(e) => setTeacherSubjectsInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    placeholder="Mathematics, Further Mathematics"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingTeacherId(null)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherAllocation}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem' }}
                >
                  Save Allocation Changes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Bus Routes & Fleet */}
      {activeTab === 'transport' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                School Bus Routes &amp; Fleet Management
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Configure bus zones, drivers, vehicle numbers, pickup stops, and termly transport fees.
              </p>
            </div>
            <button
              onClick={() => setShowAddRouteModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              <PlusCircle size={14} /> Add New Route
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {busRoutes.map((route) => (
              <div
                key={route.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: '#ffffff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold-dark)', textTransform: 'uppercase' }}>
                      {route.zone}
                    </span>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {route.routeTitle}
                    </h4>
                  </div>
                  <button
                    onClick={() => deleteBusRoute(route.id)}
                    style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                    title="Delete Route"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Driver: <strong style={{ color: '#1e293b' }}>{route.driverName}</strong> ({route.driverPhone})
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Vehicle: {route.vehicleNo} &bull; Capacity: {route.capacity} seats ({route.registeredStudents} boarded)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-navy)', fontWeight: 700 }}>
                  Termly Fare: &#8358;{(route.fee || 85000).toLocaleString()}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                  {route.stops.map((stop, sIdx) => (
                    <span key={sIdx} style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-sm)', color: '#475569' }}>
                      &bull; {stop}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Route Modal */}
          {showAddRouteModal && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                border: '2px solid var(--primary-navy)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc'
              }}
            >
              <h4 style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                Create New School Bus Route
              </h4>
              <form onSubmit={handleCreateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Zone Title:</label>
                    <input
                      type="text"
                      value={newRouteData.zone}
                      onChange={(e) => setNewRouteData({ ...newRouteData, zone: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Route Description:</label>
                    <input
                      type="text"
                      value={newRouteData.routeTitle}
                      onChange={(e) => setNewRouteData({ ...newRouteData, routeTitle: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Driver Name:</label>
                    <input
                      type="text"
                      value={newRouteData.driverName}
                      onChange={(e) => setNewRouteData({ ...newRouteData, driverName: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Driver Phone:</label>
                    <input
                      type="text"
                      value={newRouteData.driverPhone}
                      onChange={(e) => setNewRouteData({ ...newRouteData, driverPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Vehicle Reg No:</label>
                    <input
                      type="text"
                      value={newRouteData.vehicleNo}
                      onChange={(e) => setNewRouteData({ ...newRouteData, vehicleNo: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Termly Transport Fee (&#8358;):</label>
                    <input
                      type="number"
                      value={newRouteData.fee || 85000}
                      onChange={(e) => setNewRouteData({ ...newRouteData, fee: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddRouteModal(false)} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                    Create Bus Route
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Curriculum & Subjects */}
      {activeTab === 'curriculum' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                British-Nigerian Curriculum &amp; Subject Offerings
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage subjects across Cambridge Assessment International Education (CAIE) and Nigerian NERDC frameworks.
              </p>
            </div>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              <PlusCircle size={14} /> Add Subject
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {subjects.map((sub) => (
              <div
                key={sub.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gold-dark)', textTransform: 'uppercase' }}>
                    {sub.code} &bull; {sub.category}
                  </span>
                  <h4 style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--primary-navy)' }}>
                    {sub.name}
                  </h4>
                  <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                    Curriculum: <strong>{sub.curriculum}</strong>
                  </span>
                </div>
                <button
                  onClick={() => deleteSubject(sub.id)}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                  title="Delete Subject"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {showAddSubjectModal && (
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                border: '2px solid var(--primary-navy)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc'
              }}
            >
              <h4 style={{ fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
                Add New Subject to Curriculum Catalog
              </h4>
              <form onSubmit={handleCreateSubject} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Subject Name:</label>
                  <input
                    type="text"
                    value={newSubjectData.name}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Subject Code:</label>
                  <input
                    type="text"
                    value={newSubjectData.code}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, code: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Category:</label>
                  <select
                    value={newSubjectData.category}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, category: e.target.value as any })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Core">Core</option>
                    <option value="Sciences">Sciences</option>
                    <option value="Arts">Arts</option>
                    <option value="Vocational">Vocational</option>
                    <option value="Languages">Languages</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Curriculum Standard:</label>
                  <select
                    value={newSubjectData.curriculum}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, curriculum: e.target.value as any })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Blended">Blended (Dual)</option>
                    <option value="Cambridge">Cambridge CAIE</option>
                    <option value="Nigerian">Nigerian NERDC</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddSubjectModal(false)} className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                    Add Subject
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Fee Schedules */}
      {activeTab === 'fees' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Bursary Fee Schedules &amp; Invoice Ledger
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Review issued term invoices, track outstanding balances, and verify receipts.
              </p>
            </div>
            <Link href="/dashboard/finance" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
              Open Full Bursary Portal <ArrowUpRight size={14} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Invoice No</th>
                  <th style={{ padding: '0.75rem' }}>Term</th>
                  <th style={{ padding: '0.75rem' }}>Tuition (&#8358;)</th>
                  <th style={{ padding: '0.75rem' }}>Development (&#8358;)</th>
                  <th style={{ padding: '0.75rem' }}>Total Amount (&#8358;)</th>
                  <th style={{ padding: '0.75rem' }}>Paid (&#8358;)</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{inv.invoiceNo}</td>
                    <td style={{ padding: '0.75rem' }}>{inv.term} {inv.session}</td>
                    <td style={{ padding: '0.75rem' }}>&#8358;{inv.tuitionFee.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>&#8358;{inv.developmentLevy.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>&#8358;{inv.totalAmount.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', color: '#16a34a' }}>&#8358;{inv.paidAmount.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: inv.status === 'Paid' ? '#ecfdf5' : inv.status === 'Partial' ? '#fef3c7' : '#fee2e2',
                          color: inv.status === 'Paid' ? '#065f46' : inv.status === 'Partial' ? '#92400e' : '#b91c1c'
                        }}
                      >
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

