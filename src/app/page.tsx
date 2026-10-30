'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  GraduationCap,
  Trophy,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Calculator,
  UserCheck
} from 'lucide-react';

export default function PublicHomePage() {
  // Fee Estimator State
  const [gradeLevel, setGradeLevel] = useState<'eyfs' | 'primary' | 'jss' | 'sss'>('primary');
  const [includeBus, setIncludeBus] = useState(true);
  const [includeLunch, setIncludeLunch] = useState(true);

  const TUITION_RATES = {
    eyfs: 280000,
    primary: 320000,
    jss: 360000,
    sss: 400000
  };

  const BUS_RATES = {
    eyfs: 75000,
    primary: 85000,
    jss: 85000,
    sss: 85000
  };

  const LUNCH_RATES = {
    eyfs: 40000,
    primary: 45000,
    jss: 45000,
    sss: 45000
  };

  const totalEstimate =
    TUITION_RATES[gradeLevel] +
    (includeBus ? BUS_RATES[gradeLevel] : 0) +
    (includeLunch ? LUNCH_RATES[gradeLevel] : 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Announcement Bar */}
      <div
        style={{
          backgroundColor: '#030a14',
          color: '#cbd5e1',
          fontSize: '0.75rem',
          padding: '0.5rem 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} color="var(--gold-primary)" /> Plot 14/16 Airport Road, Ajao Estate, Ikeja, Lagos
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} color="var(--gold-primary)" /> Mon - Fri: 7:30 AM - 4:30 PM
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                backgroundColor: 'rgba(212, 154, 55, 0.2)',
                color: 'var(--gold-light)',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              Admissions Open 2026/2027
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={13} color="var(--gold-primary)" /> +234 (0) 803 123 4567
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header
        style={{
          backgroundColor: 'var(--primary-navy)',
          color: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(212, 154, 55, 0.25)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
          {/* Logo & School Crest */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <svg
              viewBox="0 0 100 100"
              style={{ width: '48px', height: '48px' }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 5 L88 20 C88 58 50 92 50 92 C50 92 12 58 12 20 L50 5 Z"
                fill="#0d213f"
                stroke="#d49a37"
                strokeWidth="3"
              />
              <path
                d="M50 12 L81 24 C81 54 50 83 50 83 C50 83 19 54 19 24 L50 12 Z"
                fill="#061224"
                stroke="#f3be58"
                strokeWidth="1.5"
              />
              <circle cx="50" cy="46" r="18" fill="#061224" stroke="#d49a37" strokeWidth="1" />
              <path
                d="M38 48 C43 45 48 47 50 50 C52 47 57 45 62 48 V36 C57 33 52 35 50 38 C48 35 43 33 38 36 V48 Z"
                fill="#ffd700"
              />
              <text
                x="50"
                y="60"
                fontFamily="'Outfit', sans-serif"
                fontSize="8"
                fontWeight="900"
                fill="#ffffff"
                textAnchor="middle"
              >
                DIS
              </text>
            </svg>

            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.02em', lineHeight: 1.1 }}>
                Dominion <span style={{ color: 'var(--gold-light)' }}>Int&apos;l</span> School
              </div>
              <div style={{ fontSize: '0.675rem', color: 'var(--gold-light)', fontStyle: 'italic', letterSpacing: '0.04em' }}>
                Dominion Through Excellence
              </div>
            </div>
          </Link>

          {/* Navigation Links & SMS Portal CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <nav style={{ display: 'flex', gap: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <a href="#about" style={{ color: '#cbd5e1' }}>About DIS</a>
              <a href="#academics" style={{ color: '#cbd5e1' }}>Academics</a>
              <a href="#sports" style={{ color: '#cbd5e1' }}>Sports &amp; Houses</a>
              <a href="#fees" style={{ color: '#cbd5e1' }}>Fee Schedule</a>
            </nav>

            <Link href="/dashboard" className="btn btn-primary">
              <Shield size={16} /> Open Management Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #040b15 0%, var(--primary-navy) 50%, #0d213f 100%)',
          color: '#ffffff',
          padding: '5rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(212, 154, 55, 0.15)',
                border: '1px solid var(--gold-primary)',
                color: 'var(--gold-light)',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1.5rem'
              }}
            >
              <Sparkles size={14} /> Premier Co-Educational Excellence in Ajao Estate, Lagos
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Raising Tomorrow&apos;s <span style={{ color: 'var(--gold-light)' }}>Global Leaders</span> &amp; Champions
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.7, marginBottom: '2rem' }}>
              From Montessori Early Years to Cambridge IGCSE and WAEC/WASSCE excellence. Featuring comprehensive digital student management, robotics laboratories, and active inter-house sports championships.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
                <Shield size={18} /> Launch School Management Portal <ArrowRight size={18} />
              </Link>
              <a
                href="#fees"
                className="btn btn-outline"
                style={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', padding: '0.85rem 1.5rem' }}
              >
                <Calculator size={18} /> Interactive Fee Estimator
              </a>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold-light)' }}>100%</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>WAEC &amp; Cambridge Pass Rate</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold-light)' }}>4 Houses</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Emerald, Sapphire, Ruby, Topaz</div>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--gold-light)' }}>Since 2002</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Over 2 Decades of Heritage</div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / School Portal Quick Demo Preview */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(212, 154, 55, 0.3)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>
                Management Portal Access
              </div>
              <span className="badge badge-emerald">Online &bull; Active Session</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Student Information System (SIS)</strong>: Complete roster with house allocations and admission records.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Daily Attendance Roll Call</strong>: Track present, late, and absent records with guardian notifications.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Continuous Assessment &amp; Reports</strong>: CA1, CA2 &amp; Exam scores with official printable dossier.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Fee Ledgers &amp; Receipts</strong>: Termly tuition billing, bus route passes, and bursary verification.
                </div>
              </div>
            </div>

            <Link href="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
              Enter Portal as Principal / Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Inter-House Championship Showcase */}
      <section id="sports" style={{ padding: '4.5rem 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Inter-House Championship 2026</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Four Houses. One Creed of Excellence.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.5rem' }}>
              Every Dominion scholar is inducted into one of our four iconic houses, fostering camaraderie, athletic rigor, and healthy competition.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {/* Emerald */}
            <div className="card" style={{ borderTop: '4px solid var(--emerald)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--emerald-bg)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trophy size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald)', marginBottom: '0.25rem' }}>
                Emerald House
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Green &bull; The Conquerors</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-navy)' }}>420 pts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>League Leaders</div>
            </div>

            {/* Sapphire */}
            <div className="card" style={{ borderTop: '4px solid var(--sapphire)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--sapphire-bg)', color: 'var(--sapphire)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trophy size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sapphire)', marginBottom: '0.25rem' }}>
                Sapphire House
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Blue &bull; The Royals</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-navy)' }}>395 pts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sapphire)', fontWeight: 600 }}>2nd Place</div>
            </div>

            {/* Ruby */}
            <div className="card" style={{ borderTop: '4px solid var(--ruby)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--ruby-bg)', color: 'var(--ruby)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trophy size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ruby)', marginBottom: '0.25rem' }}>
                Ruby House
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Red &bull; The Warriors</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-navy)' }}>370 pts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ruby)', fontWeight: 600 }}>Relay Champions</div>
            </div>

            {/* Topaz */}
            <div className="card" style={{ borderTop: '4px solid var(--topaz)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--topaz-bg)', color: 'var(--topaz)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Trophy size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--topaz)', marginBottom: '0.25rem' }}>
                Topaz House
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Yellow &bull; The Victors</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-navy)' }}>350 pts</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--topaz)', fontWeight: 600 }}>Swimming Gala Winners</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Fee Estimator */}
      <section id="fees" style={{ padding: '4.5rem 0', backgroundColor: '#f8fafc', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>Transparent Tuition Structure</span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
              Interactive Termly Fee Estimator
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginTop: '0.5rem' }}>
              Select your child&apos;s academic tier and optional bus or lunch subscriptions to compute the exact termly investment.
            </p>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Academic Section
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {(['eyfs', 'primary', 'jss', 'sss'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setGradeLevel(lvl)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: gradeLevel === lvl ? '2px solid var(--gold-primary)' : '1px solid var(--border-color)',
                      backgroundColor: gradeLevel === lvl ? 'var(--gold-badge)' : '#ffffff',
                      fontWeight: gradeLevel === lvl ? 800 : 600,
                      color: gradeLevel === lvl ? 'var(--primary-navy)' : 'var(--text-muted)',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {lvl === 'eyfs' ? 'Early Years' : lvl === 'primary' ? 'Primary' : lvl === 'jss' ? 'JSS 1-3' : 'SSS 1-3'}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Services Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: includeBus ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={includeBus}
                  onChange={(e) => setIncludeBus(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--emerald)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>School Bus Route</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Air-conditioned (Zone A, B, or C) &bull; &#8358;{BUS_RATES[gradeLevel].toLocaleString()}/term
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: includeLunch ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={includeLunch}
                  onChange={(e) => setIncludeLunch(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--emerald)' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Daily Hot Lunch Program</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Chef-curated nutrition &bull; &#8358;{LUNCH_RATES[gradeLevel].toLocaleString()}/term
                  </div>
                </div>
              </label>
            </div>

            {/* Calculation Result */}
            <div
              style={{
                backgroundColor: 'var(--primary-navy)',
                color: '#ffffff',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Estimated Termly Tuition &amp; Services
                </div>
                <div style={{ fontSize: '2.25rem', fontWeight: 900 }}>
                  &#8358;{totalEstimate.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Includes Tuition, Development, Robotics Lab, and selected services.
                </div>
              </div>

              <Link href="/dashboard/finance" className="btn btn-primary">
                View Fee Ledgers &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#030a14',
          color: '#cbd5e1',
          padding: '3rem 0 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: 'auto'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#ffffff' }}>
              Dominion International School
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)' }}>
              Plot 14/16 Airport Road, Ajao Estate, Ikeja, Lagos State, Nigeria
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Phone: +234 (0) 803 123 4567 | Email: info@dominioninternational.sch.ng
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              <Shield size={14} /> Open SMS Portal
            </Link>
            <a href="https://wa.me/2348031234567" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ color: '#ffffff' }}>
              WhatsApp Help Desk
            </a>
          </div>
        </div>

        <div className="container" style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem' }}>
          &copy; 2002 - {new Date().getFullYear()} Dominion International School. All Rights Reserved. &ldquo;Dominion Through Excellence&rdquo;.
        </div>
      </footer>
    </div>
  );
}
