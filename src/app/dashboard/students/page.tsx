'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  CheckCircle,
  X,
  CreditCard,
  Printer,
  Shield,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useSchoolStore } from '../../../lib/store';
import { Student, ClassLevel, ClassArm, HouseColor } from '../../../lib/types';

export default function StudentsPage() {
  const { students, addStudent, updateStudent } = useSchoolStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedHouse, setSelectedHouse] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Female' as 'Male' | 'Female',
    dob: '2012-05-10',
    classLevel: 'JSS 1' as ClassLevel,
    arm: 'Emerald' as ClassArm,
    house: 'Emerald' as HouseColor,
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    bloodGroup: 'O+',
    status: 'Active' as const
  });

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'All' || s.classLevel === selectedClass;
    const matchesHouse = selectedHouse === 'All' || s.house === selectedHouse;

    return matchesSearch && matchesClass && matchesHouse;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.guardianName) {
      alert('Please fill in student name and guardian details.');
      return;
    }

    addStudent(formData);
    setIsAddModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      gender: 'Female',
      dob: '2012-05-10',
      classLevel: 'JSS 1',
      arm: 'Emerald',
      house: 'Emerald',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: '',
      bloodGroup: 'O+',
      status: 'Active'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Student Information System (SIS)
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage student registrations, house allocations, arms, and official school records.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={16} /> Enroll New Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search by name, admission no (DIS/...), or guardian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Class Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Class:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Classes</option>
            <option value="Pre-Nursery">Pre-Nursery</option>
            <option value="Nursery 1">Nursery 1</option>
            <option value="Nursery 2">Nursery 2</option>
            <option value="Basic 1">Basic 1</option>
            <option value="Basic 2">Basic 2</option>
            <option value="Basic 3">Basic 3</option>
            <option value="Basic 4">Basic 4</option>
            <option value="Basic 5">Basic 5</option>
            <option value="Basic 6">Basic 6</option>
            <option value="JSS 1">JSS 1</option>
            <option value="JSS 2">JSS 2</option>
            <option value="JSS 3">JSS 3</option>
            <option value="SSS 1">SSS 1</option>
            <option value="SSS 2">SSS 2</option>
            <option value="SSS 3">SSS 3</option>
          </select>
        </div>

        {/* House Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>House:</span>
          <select
            value={selectedHouse}
            onChange={(e) => setSelectedHouse(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Houses</option>
            <option value="Emerald">Emerald (Green)</option>
            <option value="Sapphire">Sapphire (Blue)</option>
            <option value="Ruby">Ruby (Red)</option>
            <option value="Topaz">Topaz (Yellow)</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Adm. No</th>
              <th>Student Name</th>
              <th>Class &amp; Arm</th>
              <th>Sports House</th>
              <th>Guardian Contact</th>
              <th>Blood Group</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No students found matching your filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {student.admissionNo}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.gender} &bull; DOB: {student.dob}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{student.classLevel}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      ({student.arm})
                    </span>
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
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{student.guardianName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{student.guardianPhone}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#475569' }}>{student.bloodGroup}</span>
                  </td>
                  <td>
                    <span className="badge badge-emerald">
                      <CheckCircle size={12} /> {student.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.65rem' }}
                    >
                      <Eye size={14} /> Profile &amp; ID Card
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Enroll New Student */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Enroll New Student</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Oluwaseun"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Adebayo"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="form-select"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="AA">AA (Genotype)</option>
                    <option value="AS">AS (Genotype)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Class Level</label>
                  <select
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Pre-Nursery">Pre-Nursery</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="Nursery 2">Nursery 2</option>
                    <option value="Basic 1">Basic 1</option>
                    <option value="Basic 2">Basic 2</option>
                    <option value="Basic 3">Basic 3</option>
                    <option value="Basic 4">Basic 4</option>
                    <option value="Basic 5">Basic 5</option>
                    <option value="Basic 6">Basic 6</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Class Arm</label>
                  <select
                    value={formData.arm}
                    onChange={(e) => setFormData({ ...formData, arm: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Emerald">Emerald</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sports House Allocation</label>
                  <select
                    value={formData.house}
                    onChange={(e) => setFormData({ ...formData, house: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="Emerald">Emerald (Green)</option>
                    <option value="Sapphire">Sapphire (Blue)</option>
                    <option value="Ruby">Ruby (Red)</option>
                    <option value="Topaz">Topaz (Yellow)</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-navy)' }}>
                  Parent / Guardian Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="form-input"
                      placeholder="e.g. Mr. &amp; Mrs. Adebayo"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Guardian Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="form-input"
                      placeholder="+234 803 123 4567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Guardian Email</label>
                  <input
                    type="email"
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                    className="form-input"
                    placeholder="guardian@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="form-input"
                    placeholder="e.g. Plot 15 Chivita Ave, Ajao Estate, Lagos"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Admission &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Profile & ID Card Preview */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Official Student Identity Card</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Visual Student ID Card */}
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '2px solid var(--gold-primary)',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: '#ffffff'
              }}
            >
              {/* ID Header */}
              <div
                style={{
                  backgroundColor: 'var(--primary-navy)',
                  color: '#ffffff',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '3px solid var(--gold-primary)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={24} color="var(--gold-light)" />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, letterSpacing: '0.05em' }}>
                      DOMINION INTERNATIONAL SCHOOL
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)' }}>
                      Dominion Through Excellence &bull; Lagos
                    </div>
                  </div>
                </div>
                <span className="badge badge-gold">STUDENT ID</span>
              </div>

              {/* ID Body */}
              <div style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                {/* Photo Placeholder */}
                <div
                  style={{
                    width: '100px',
                    height: '115px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--sapphire-bg)',
                    border: '2px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sapphire)',
                    flexShrink: 0
                  }}
                >
                  <Users size={36} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '4px' }}>OFFICIAL PHOTO</span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-hover)', marginBottom: '0.5rem' }}>
                    ADM NO: {selectedStudent.admissionNo}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Class:</span>{' '}
                      <strong>{selectedStudent.classLevel} ({selectedStudent.arm})</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>House:</span>{' '}
                      <strong>{selectedStudent.house}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Blood Group:</span>{' '}
                      <strong>{selectedStudent.bloodGroup}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Gender:</span>{' '}
                      <strong>{selectedStudent.gender}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Footer */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '0.75rem 1.25rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>Valid for 2026/2027 Academic Session</div>
                <div>Principal&apos;s Signature: <em>Olwaseyi (PhD)</em></div>
              </div>
            </div>

            {/* Guardian & Contact Details */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Guardian &amp; Emergency Contact</h3>
              <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span><strong>Guardian:</strong> {selectedStudent.guardianName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} color="var(--text-muted)" />
                  <span><strong>Phone:</strong> {selectedStudent.guardianPhone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} color="var(--text-muted)" />
                  <span><strong>Email:</strong> {selectedStudent.guardianEmail}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span><strong>Home Address:</strong> {selectedStudent.address}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => window.print()}
                className="btn btn-navy"
              >
                <Printer size={16} /> Print ID Card
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

