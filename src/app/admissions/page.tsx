'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Bus,
  ArrowLeft
} from 'lucide-react';
import { useSchoolStore } from '../../lib/store';
import { ClassLevel } from '../../lib/types';

export default function AdmissionsPage() {
  const { selfRegisterStudent } = useSchoolStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    dob: '2011-04-12',
    classLevel: 'SSS 2' as ClassLevel,
    bloodGroup: 'O+',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    previousSchool: 'Crown Heights Academy, Lagos',
    busService: 'Zone A - Ajao Estate'
  });

  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const student = await selfRegisterStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dob: formData.dob,
        classLevel: formData.classLevel,
        bloodGroup: formData.bloodGroup,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        address: formData.address,
        status: 'Active'
      });

      setSubmittedRef(student.admissionNo);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Top Banner */}
      <header
        style={{
          backgroundColor: 'var(--primary-navy)',
          color: '#ffffff',
          padding: '1.25rem 2rem',
          borderBottom: '3px solid var(--gold-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            href="/"
            style={{
              color: 'var(--gold-light)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} /> Back to Website
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</span>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}>
            Dominion International School Admissions
          </span>
        </div>

        <Link href="/dashboard" className="btn btn-outline" style={{ color: '#ffffff', borderColor: 'var(--gold-primary)', fontSize: '0.8rem' }}>
          Go to SMS Dashboard <ArrowRight size={14} />
        </Link>
      </header>

      <main style={{ maxWidth: '850px', margin: '3rem auto', padding: '0 1.5rem' }}>
        {submittedRef ? (
          <div
            className="card"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '2px solid #10b981',
              backgroundColor: '#ffffff'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}
            >
              <CheckCircle2 size={36} color="#059669" />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Application Successfully Submitted!
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '600px', margin: '0.75rem auto 1.5rem' }}>
              Your digital admission dossier has been received and entered into the Dominion School Information System.
            </p>

            <div
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                backgroundColor: '#f1f5f9',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed #cbd5e1',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Temporary Application Reference
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-navy)', marginTop: '0.25rem' }}>
                {submittedRef}
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                maxWidth: '650px',
                margin: '0 auto 2rem',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#92400e', marginBottom: '0.5rem' }}>
                Next Steps in the Dominion Onboarding Pipeline:
              </div>
              <ol style={{ fontSize: '0.85rem', color: '#78350f', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                <li><strong>Admin Review:</strong> The Principal will review your submission and assign your official <strong>House</strong> (Emerald, Sapphire, Ruby, or Topaz).</li>
                <li><strong>Official Number:</strong> An official student registration number (`DIS/2026/04XX`) will be issued.</li>
                <li><strong>Class Claim:</strong> Your Form Tutor will claim your file into your assigned class arm (e.g. <em>{formData.classLevel} Emerald</em>).</li>
                <li><strong>Parent Portal:</strong> Real-time attendance, fee invoices, and report cards will unlock on your portal.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setSubmittedRef(null);
                  setFormData({
                    firstName: '',
                    lastName: '',
                    gender: 'Male',
                    dob: '2011-04-12',
                    classLevel: 'SSS 2',
                    bloodGroup: 'O+',
                    guardianName: '',
                    guardianPhone: '',
                    guardianEmail: '',
                    address: '',
                    previousSchool: '',
                    busService: 'Zone A - Ajao Estate'
                  });
                }}
                className="btn btn-outline"
              >
                Submit Another Application
              </button>
              <Link href="/dashboard" className="btn btn-primary">
                View in Admin Dashboard &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(212, 154, 55, 0.15)',
                  color: 'var(--gold-dark)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem'
                }}
              >
                <Sparkles size={14} /> 2026/2027 Academic Year Intake
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Student Digital Admission &amp; Intake Form
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                Complete candidate biodata and guardian contacts to initiate enrollment into Dominion International School.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Section 1: Candidate Biodata */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  1. Candidate Biodata
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Candidate First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oluwaseun"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Candidate Last Name (Surname) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adeleke"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Gender *
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Target Class Level *
                    </label>
                    <select
                      value={formData.classLevel}
                      onChange={(e) => setFormData({ ...formData, classLevel: e.target.value as ClassLevel })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    >
                      <option value="SSS 3">SSS 3 (WAEC &amp; Cambridge IGCSE)</option>
                      <option value="SSS 2">SSS 2 (Senior Secondary)</option>
                      <option value="SSS 1">SSS 1 (Senior Secondary)</option>
                      <option value="JSS 3">JSS 3 (Cambridge Checkpoint &amp; BECE)</option>
                      <option value="JSS 2">JSS 2 (Junior Secondary)</option>
                      <option value="JSS 1">JSS 1 (Junior Secondary)</option>
                      <option value="Basic 5">Basic 5 (Primary)</option>
                      <option value="Basic 4">Basic 4 (Primary)</option>
                      <option value="Basic 3">Basic 3 (Primary)</option>
                      <option value="Basic 2">Basic 2 (Primary)</option>
                      <option value="Basic 1">Basic 1 (Primary)</option>
                      <option value="Nursery 2">Nursery 2 (Early Years)</option>
                      <option value="Nursery 1">Nursery 1 (Early Years)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Blood Group *
                    </label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    >
                      <option value="O+">O+ (Universal Positive)</option>
                      <option value="O-">O- (Universal Donor)</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="AA">AA Genotype</option>
                      <option value="AS">AS Genotype</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Guardian Contacts */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  2. Parent / Guardian Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Guardian Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Babatunde Adeyemi"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Guardian Phone Number (+234) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 803 123 4567"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Guardian Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="babatunde.adeyemi@gmail.com"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Residential Address in Lagos *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 14 Stella Sholanke Street, Ajao Estate, Lagos"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Transport & Logistics */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  3. School Transport &amp; Services
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      School Bus Route Interest
                    </label>
                    <select
                      value={formData.busService}
                      onChange={(e) => setFormData({ ...formData, busService: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Zone A - Ajao Estate">Zone A: Ajao Estate - Chivita Axis</option>
                      <option value="Zone B - Mafoluku / Oshodi">Zone B: Mafoluku - Oshodi Axis</option>
                      <option value="Zone C - Isolo / Ago Palace">Zone C: Isolo - Ago Palace Way Axis</option>
                      <option value="No Bus Required">Self Drop-off / Parent Transport</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Previous School Attended
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Corona School, Gbagada"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Link href="/" className="btn btn-outline">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                >
                  {submitting ? 'Transmitting Application...' : 'Submit Digital Admission Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

