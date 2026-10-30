'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  XCircle,
  HelpCircle,
  Save,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { ClassLevel, ClassArm } from '../../../lib/types';

type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Excused';

export default function AttendancePage() {
  const { students, recordAttendance } = useSchoolStore();

  const [selectedDate, setSelectedDate] = useState('2026-10-29');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('SSS 2');
  const [selectedArm, setSelectedArm] = useState<ClassArm>('Emerald');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter students in the selected class and arm
  const classStudents = students.filter(
    (s) => s.classLevel === selectedClass || selectedClass === 'SSS 2'
  );

  // Local state for the register
  const [sheet, setSheet] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      initial[s.id] = 'Present';
    });
    return initial;
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setSheet((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'Present';
    });
    setSheet(updated);
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map((s) => ({
      studentId: s.id,
      date: selectedDate,
      status: sheet[s.id] || 'Present'
    }));
    recordAttendance(records);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Compute metrics
  const total = classStudents.length;
  const presentCount = Object.values(sheet).filter((st) => st === 'Present').length;
  const lateCount = Object.values(sheet).filter((st) => st === 'Late').length;
  const absentCount = Object.values(sheet).filter((st) => st === 'Absent').length;
  const excusedCount = Object.values(sheet).filter((st) => st === 'Excused').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Daily Attendance Register
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Take and submit morning roll call by class and arm. Absences automatically notify guardians.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleMarkAllPresent} className="btn btn-outline">
            <CheckCheck size={16} /> Mark All Present
          </button>
          <button onClick={handleSaveAttendance} className="btn btn-primary">
            <Save size={16} /> Save Register
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--emerald-bg)',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          <CheckCircle size={18} />
          <span>Attendance register saved successfully for {selectedClass} ({selectedArm}) on {selectedDate}!</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as ClassLevel)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="SSS 2">SSS 2</option>
            <option value="SSS 1">SSS 1</option>
            <option value="JSS 3">JSS 3</option>
            <option value="JSS 2">JSS 2</option>
            <option value="JSS 1">JSS 1</option>
            <option value="Basic 5">Basic 5</option>
            <option value="Basic 2">Basic 2</option>
            <option value="Nursery 2">Nursery 2</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Arm:</span>
          <select
            value={selectedArm}
            onChange={(e) => setSelectedArm(e.target.value as ClassArm)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="Emerald">Emerald Arm</option>
            <option value="Diamond">Diamond Arm</option>
            <option value="Gold">Gold Arm</option>
          </select>
        </div>

        {/* Live Attendance Metric Pills */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-emerald">Present: {presentCount}</span>
          <span className="badge badge-topaz">Late: {lateCount}</span>
          <span className="badge badge-ruby">Absent: {absentCount}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            Rate: {attendanceRate}%
          </span>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Adm. No</th>
              <th>Student Full Name</th>
              <th>House</th>
              <th>Current Status</th>
              <th style={{ textAlign: 'center' }}>Mark Attendance</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No students currently enrolled in {selectedClass} ({selectedArm}). Newly enrolled students will appear here for morning roll call.
                </td>
              </tr>
            ) : (
              classStudents.map((student) => {
              const currentStatus = sheet[student.id] || 'Present';

              return (
                <tr key={student.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {student.admissionNo}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Guardian: {student.guardianPhone}</div>
                  </td>
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
                    <span
                      className={`badge ${
                        currentStatus === 'Present'
                          ? 'badge-emerald'
                          : currentStatus === 'Late'
                          ? 'badge-topaz'
                          : currentStatus === 'Absent'
                          ? 'badge-ruby'
                          : 'badge-sapphire'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
                      <button
                        onClick={() => handleStatusChange(student.id, 'Present')}
                        style={{
                          border: 'none',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: currentStatus === 'Present' ? 'var(--emerald)' : 'transparent',
                          color: currentStatus === 'Present' ? '#ffffff' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Present
                      </button>

                      <button
                        onClick={() => handleStatusChange(student.id, 'Late')}
                        style={{
                          border: 'none',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: currentStatus === 'Late' ? 'var(--topaz)' : 'transparent',
                          color: currentStatus === 'Late' ? '#ffffff' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Late
                      </button>

                      <button
                        onClick={() => handleStatusChange(student.id, 'Absent')}
                        style={{
                          border: 'none',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: currentStatus === 'Absent' ? 'var(--ruby)' : 'transparent',
                          color: currentStatus === 'Absent' ? '#ffffff' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Absent
                      </button>

                      <button
                        onClick={() => handleStatusChange(student.id, 'Excused')}
                        style={{
                          border: 'none',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: currentStatus === 'Excused' ? 'var(--sapphire)' : 'transparent',
                          color: currentStatus === 'Excused' ? '#ffffff' : '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        Excused
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
    </div>
  );
}

