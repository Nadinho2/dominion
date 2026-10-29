'use client';

import React from 'react';
import { UserRole } from '../lib/types';
import { useSchoolStore } from '../lib/store';
import { User, BellRing, Sparkles } from 'lucide-react';

export default function TopNav() {
  const { role, changeRole } = useSchoolStore();

  const ROLES: { id: UserRole; label: string; demoUser: string }[] = [
    { id: 'admin', label: 'Admin/Principal', demoUser: 'Dr. O. Adeleke' },
    { id: 'teacher', label: 'Teacher', demoUser: 'Mrs. C. Eze' },
    { id: 'student', label: 'Student', demoUser: 'Chioma Adeyemi' },
    { id: 'parent', label: 'Parent', demoUser: 'Dr. B. Adeyemi' }
  ];

  const currentRoleObj = ROLES.find((r) => r.id === role) || ROLES[0];

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
      className="no-print"
    >
      {/* Left Academic Session Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--gold-badge)',
            border: '1px solid var(--gold-border)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#854d0e'
          }}
        >
          <Sparkles size={14} color="#d97706" />
          <span>2026/2027 Academic Session &bull; 1st Term</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Ajao Estate Campus, Lagos
        </div>
      </div>

      {/* Right Controls: Role Switcher & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Switcher Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #e2e8f0',
            gap: '0.25rem'
          }}
        >
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', padding: '0 0.5rem' }}>
            Switch Role:
          </span>
          {ROLES.map((r) => {
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => changeRole(r.id)}
                style={{
                  border: 'none',
                  padding: '0.3rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'var(--primary-navy)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Notifications Icon */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Announcements & Alerts"
        >
          <BellRing size={16} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--ruby)',
              borderRadius: '50%'
            }}
          />
        </div>

        {/* Current User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--secondary-navy)',
              color: 'var(--gold-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              border: '2px solid var(--gold-primary)'
            }}
          >
            <User size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {currentRoleObj.demoUser}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

