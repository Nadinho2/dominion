'use client';

import React, { useState } from 'react';
import {
  Award,
  Plus,
  Printer,
  X,
  Sparkles,
  CheckCircle,
  FileText,
  Shield,
  HelpCircle,
  Mail
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { GradeRecord, Student } from '../../../lib/types';

export default function GradesPage() {
  const { students, grades, subjects, addGrade } = useSchoolStore();

  const [selectedStudentForReport, setSelectedStudentForReport] = useState<Student | null>(null);
  const [isAddScoreOpen, setIsAddScoreOpen] = useState(false);
  const [emailingDossier, setEmailingDossier] = useState(false);
  const [emailDossierSent, setEmailDossierSent] = useState(false);

  const handleEmailReportCard = async (student: Student) => {
    if (!student.guardianEmail) {
      alert('No guardian email address registered for this student.');
      return;
    }
    const stGrades = getStudentGrades(student.id);
    const avg = stGrades.length > 0
      ? Math.round(stGrades.reduce((acc, g) => acc + g.total, 0) / stGrades.length)
      : 82;

    setEmailingDossier(true);
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'report_card',
          payload: {
            guardianEmail: student.guardianEmail,
            guardianName: student.guardianName || 'Parent / Guardian',
            studentName: `${student.firstName} ${student.lastName}`,
            term: '1st Term',
            session: '2026/2027',
            average: avg
          }
        })
      });
      setEmailDossierSent(true);
      setTimeout(() => setEmailDossierSent(false), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setEmailingDossier(false);
    }
  };

  // Form State for new assessment
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [subjectCode, setSubjectCode] = useState(subjects[0]?.code || '');
  const [term, setTerm] = useState<'1st Term' | '2nd Term' | '3rd Term'>('1st Term');
  const [session, setSession] = useState('2026/2027');
  const [ca1, setCa1] = useState(18);
  const [ca2, setCa2] = useState(18);
  const [exam, setExam] = useState(50);

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subjects.find((s) => s.code === subjectCode);

    addGrade({
      studentId,
      subjectCode,
      subjectName: sub ? sub.name : 'General Subject',
      term,
      session,
      ca1: Number(ca1),
      ca2: Number(ca2),
      exam: Number(exam)
    });

    setIsAddScoreOpen(false);
  };

  const getStudentGrades = (sId: string) => {
    return grades.filter((g) => g.studentId === sId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Continuous Assessment &amp; Terminal Report Cards
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Enter CA1 (20%), CA2 (20%), Exam (60%) scores and generate authentic printable terminal report cards.
          </p>
        </div>

        <button onClick={() => setIsAddScoreOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Enter Assessment Scores
        </button>
      </div>

      {/* Grade Scale Reference Card */}
      <div
        className="card"
        style={{
          padding: '1rem',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
          Dominion Grading Scale:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald">A1 (75-100% Distinction)</span>
          <span className="badge badge-sapphire">B2-B3 (65-74% Credit)</span>
          <span className="badge badge-gold">C4-C6 (50-64% Pass)</span>
          <span className="badge badge-topaz">D7-E8 (40-49% Weak)</span>
          <span className="badge badge-ruby">F9 (0-39% Fail)</span>
        </div>
      </div>

      {/* Student List with Report Card Generator */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Adm. No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>House</th>
              <th>Subjects Graded</th>
              <th>Term Average</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No enrolled students yet. When students are enrolled into classes, their assessment dossiers and printable report cards will appear here.
                </td>
              </tr>
            ) : (
              students.map((student) => {
              const studentGrades = getStudentGrades(student.id);
              const totalScore = studentGrades.reduce((acc, g) => acc + g.total, 0);
              const avg = studentGrades.length > 0 ? Math.round(totalScore / studentGrades.length) : 0;

              return (
                <tr key={student.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {student.admissionNo}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guardian: {student.guardianName}</div>
                  </td>
                  <td>{student.classLevel} ({student.arm})</td>
                  <td>
                    <span
                      className={`badge ${
                        student.house === 'Emerald'
                          ? 'badge-emerald'
                          : student.house === 'Sapphire'
                          ? 'badge-sapphire'
                          : student.house === 'Ruby'
                          ? 'badge-ruby'
                          : 'badge-topaz'
                      }`}
                    >
                      {student.house}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-gold">{studentGrades.length} Subjects</span>
                  </td>
                  <td>
                    {avg > 0 ? (
                      <span style={{ fontWeight: 700, color: avg >= 75 ? 'var(--emerald)' : 'var(--primary-navy)' }}>
                        {avg}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedStudentForReport(student)}
                      className="btn btn-navy btn-sm"
                    >
                      <FileText size={14} /> Generate Report Card
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Modal: Enter Assessment Scores */}
      {isAddScoreOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Record Continuous Assessment</h2>
              <button
                onClick={() => setIsAddScoreOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveScore}>
              <div className="form-group">
                <label className="form-label">Select Student *</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="form-select"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.admissionNo} - {s.firstName} {s.lastName} ({s.classLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="form-select"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.code}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Term</label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">CA 1 Score (Max 20)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={ca1}
                    onChange={(e) => setCa1(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CA 2 Score (Max 20)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    required
                    value={ca2}
                    onChange={(e) => setCa2(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Terminal Exam (Max 60)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={exam}
                    onChange={(e) => setExam(Number(e.target.value))}
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--gold-badge)',
                  border: '1px solid var(--gold-border)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem'
                }}
              >
                <span>Calculated Total: <strong>{Number(ca1) + Number(ca2) + Number(exam)} / 100</strong></span>
                <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                  Grading is automatically applied.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddScoreOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Assessment Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Terminal Report Card Generator */}
      {selectedStudentForReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px', padding: '2rem' }}>
            {/* Action Bar (Hidden when printing) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--primary-navy)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Official Terminal Student Assessment Dossier</h3>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => handleEmailReportCard(selectedStudentForReport)}
                  disabled={emailingDossier}
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--gold-primary)', color: 'var(--primary-navy)' }}
                >
                  <Mail size={16} />
                  {emailDossierSent ? '✓ Dossier Sent!' : emailingDossier ? 'Dispatching...' : 'Email Report Card'}
                </button>
                <button onClick={() => window.print()} className="btn btn-primary">
                  <Printer size={16} /> Print / Save as PDF
                </button>
                <button onClick={() => setSelectedStudentForReport(null)} className="btn btn-outline">
                  Close
                </button>
              </div>
            </div>

            {/* Official Report Card Printable Sheet */}
            <div
              className="report-card-sheet"
              style={{
                border: '2px solid var(--primary-navy)',
                padding: '2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Report Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid var(--gold-primary)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <Shield size={36} color="var(--primary-navy)" />
                  <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary-navy)', letterSpacing: '0.04em' }}>
                      DOMINION INTERNATIONAL SCHOOL
                    </h1>
                    <div style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--gold-hover)', fontSize: '0.85rem' }}>
                      &ldquo;Dominion Through Excellence&rdquo;
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Plot 14/16 Airport Road, Ajao Estate, Ikeja, Lagos State, Nigeria &bull; Phone: +234 (0) 803 123 4567
                </div>
                <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 1rem', backgroundColor: 'var(--primary-navy)', color: '#ffffff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                  TERMLY CONTINUOUS ASSESSMENT &amp; EXAMINATION DOSSIER &bull; 1ST TERM 2026/2027
                </div>
              </div>

              {/* Student Metadata Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div><strong>Student Name:</strong> {selectedStudentForReport.firstName} {selectedStudentForReport.lastName}</div>
                <div><strong>Admission No:</strong> {selectedStudentForReport.admissionNo}</div>
                <div><strong>Class:</strong> {selectedStudentForReport.classLevel} ({selectedStudentForReport.arm})</div>
                <div><strong>Sports House:</strong> {selectedStudentForReport.house}</div>
                <div><strong>Times School Opened:</strong> 65 Days</div>
                <div><strong>Times Present:</strong> 64 Days (98.5%)</div>
              </div>

              {/* Subject Scores Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--primary-navy)', color: '#ffffff' }}>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'left' }}>Subject</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>CA 1 (20)</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>CA 2 (20)</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>Exam (60)</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>Total (100)</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>Grade</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'left' }}>Subject Teacher Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {getStudentGrades(selectedStudentForReport.id).length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid #ccc' }}>
                        Assessment scores are currently being moderated for this student.
                      </td>
                    </tr>
                  ) : (
                    getStudentGrades(selectedStudentForReport.id).map((g) => (
                      <tr key={g.id}>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem', fontWeight: 600 }}>{g.subjectName}</td>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>{g.ca1}</td>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>{g.ca2}</td>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center' }}>{g.exam}</td>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center', fontWeight: 800 }}>
                          {g.total}
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem', textAlign: 'center', fontWeight: 800, color: g.grade === 'A1' ? 'var(--emerald)' : 'inherit' }}>
                          {g.grade}
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>{g.remark}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Form Master & Principal Remarks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-navy)' }}>
                    Form Tutor&apos;s Appraisal:
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                    &ldquo;An exceptionally focused and well-disciplined scholar. Shows tremendous leadership both in academic debates and within {selectedStudentForReport.house} house.&rdquo;
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', borderTop: '1px dashed #ccc', paddingTop: '0.35rem' }}>
                    Signature: <strong>Mr. Olumide Adeleke (M.Sc)</strong>
                  </div>
                </div>

                <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-navy)' }}>
                    Principal&apos;s Endorsement &amp; Next Term:
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                    &ldquo;Commendable achievement. Keep striving for the crest of excellence. Next term commences on January 11, 2027.&rdquo;
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', borderTop: '1px dashed #ccc', paddingTop: '0.35rem' }}>
                    Principal: <strong>Olwaseyi (PhD, FIMC)</strong> &bull; DIS Seal Affixed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

