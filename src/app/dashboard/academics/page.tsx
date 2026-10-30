'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { ClassLevel } from '../../../lib/types';

export default function AcademicsPage() {
  const { teachers, subjects, students } = useSchoolStore();
  const [activeTab, setActiveTab] = useState<'classes' | 'subjects' | 'timetable'>('classes');

  const CLASS_STRUCTURE: { section: string; levels: ClassLevel[]; desc: string }[] = [
    {
      section: 'Early Years Foundation Stage (EYFS)',
      levels: ['Pre-Nursery', 'Nursery 1', 'Nursery 2'],
      desc: 'Montessori-aligned foundational sensory learning, phonics, numeracy & motor development.'
    },
    {
      section: 'Primary School (Basic 1 – 6)',
      levels: ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6'],
      desc: 'Cambridge Primary Framework & Checkpoint preparation, Cowbellpedia math training, and STEM.'
    },
    {
      section: 'Junior Secondary School (JSS 1 – 3)',
      levels: ['JSS 1', 'JSS 2', 'JSS 3'],
      desc: 'Cambridge Lower Secondary & BECE curriculum, intro to Coding, Robotics practicals, and Science labs.'
    },
    {
      section: 'Senior Secondary School (SSS 1 – 3)',
      levels: ['SSS 1', 'SSS 2', 'SSS 3'],
      desc: 'Cambridge IGCSE & WAEC/WASSCE/NECO excellence, Science practicals, Arts & Model UN.'
    }
  ];

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const PERIODS = [
    { time: '08:00 - 08:45', name: 'Period 1: Mathematics / Numeracy' },
    { time: '08:45 - 09:30', name: 'Period 2: English Language / Literacy' },
    { time: '09:30 - 10:15', name: 'Period 3: Basic Science & Tech / Physics' },
    { time: '10:15 - 10:45', name: 'Recess & Morning Snack Break' },
    { time: '10:45 - 11:30', name: 'Period 4: Robotics & AI Practical' },
    { time: '11:30 - 12:15', name: 'Period 5: Chemistry / Social Studies' },
    { time: '12:15 - 01:00', name: 'Lunch & Library Study' },
    { time: '01:00 - 02:00', name: 'Period 6: French / Civic Education' },
    { time: '02:00 - 03:30', name: 'Co-Curricular: Sports / Taekwondo / Debating' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Academics &amp; Curriculum Management
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage class sections, Cambridge-Nigerian blended subjects, form tutors, and master period timetables.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('classes')}
          className={`btn btn-sm ${activeTab === 'classes' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Layers size={14} /> Classes &amp; Arms Directory
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`btn btn-sm ${activeTab === 'subjects' ? 'btn-primary' : 'btn-outline'}`}
        >
          <BookOpen size={14} /> Curriculum &amp; Subjects
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`btn btn-sm ${activeTab === 'timetable' ? 'btn-primary' : 'btn-outline'}`}
        >
          <Clock size={14} /> Master Timetable
        </button>
      </div>

      {/* TAB 1: Classes Directory */}
      {activeTab === 'classes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {CLASS_STRUCTURE.map((sec, idx) => (
            <div key={idx} className="card">
              <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  {sec.section}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sec.desc}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {sec.levels.map((lvl) => {
                  const studentCount = students.filter((s) => s.classLevel === lvl).length;
                  const assignedTeacher = teachers.find((t) => t.assignedClass === lvl);

                  return (
                    <div
                      key={lvl}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>
                          {lvl}
                        </span>
                        <span className="badge badge-sapphire">
                          {studentCount === 1 ? '1 Student' : `${studentCount} Students`}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Arms: <strong>Emerald, Diamond, Gold</strong>
                      </div>

                      <div
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#ffffff',
                          padding: '0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.675rem' }}>Form Master / Mistress:</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {assignedTeacher ? assignedTeacher.name : 'Unassigned (Awaiting Deployment)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Subjects Directory */}
      {activeTab === 'subjects' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Blended British-Nigerian Curriculum Subjects</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Aligned with Cambridge International Primary/Secondary and Federal Ministry of Education Nigeria.
              </p>
            </div>
            <span className="badge badge-gold">
              <Sparkles size={12} /> Cambridge &amp; WAEC Accredited
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Title</th>
                  <th>Category</th>
                  <th>Curriculum Framework</th>
                  <th>Lead Instructor</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-hover)' }}>{sub.code}</td>
                    <td style={{ fontWeight: 600 }}>{sub.name}</td>
                    <td>
                      <span className="badge badge-sapphire">{sub.category}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          sub.curriculum === 'Cambridge'
                            ? 'badge-emerald'
                            : sub.curriculum === 'Blended'
                            ? 'badge-gold'
                            : 'badge-topaz'
                        }`}
                      >
                        {sub.curriculum}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Faculty Directorate
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Master Timetable */}
      {activeTab === 'timetable' && (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Daily Period Master Schedule</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Standard operational bell schedule across Primary, Junior Secondary &amp; Senior Secondary wings.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {PERIODS.map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: p.name.includes('Break') || p.name.includes('Lunch') ? 'var(--gold-badge)' : '#ffffff',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} color="var(--gold-hover)" />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.time}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-navy)' }}>
                  {p.name}
                </div>
                <span className="badge badge-emerald">Active Schedule</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

