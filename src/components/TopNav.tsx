'use client';

import React, { useEffect } from 'react';
import { UserRole } from '../lib/types';
import { useSchoolStore } from '../lib/store';
import { useUser, UserButton } from '@clerk/nextjs';
import { BellRing, Sparkles, ShieldCheck } from 'lucide-react';

export default function TopNav() {
  const { role, changeRole } = useSchoolStore();
  const { user, isLoaded } = useUser();

  // Sync role from Clerk metadata if present
  useEffect(() => {
    if (isLoaded && user) {
      const clerkRole = (user.publicMetadata?.role as UserRole) || 
        (user.organizationMemberships?.[0]?.role === 'org:admin' ? 'admin' : null);
      if (clerkRole && clerkRole !== role) {
        changeRole(clerkRole);
      }
    }
  }, [isLoaded, user]);

  const ROLES: { id: UserRole; label: string }[] = [
    { id: 'admin', label: 'Admin/Principal' },
    { id: 'teacher', label: 'Teacher' },
    { id: 'student', label: 'Student' },
    { id: 'parent', label: 'Parent' }
  ];

  const displayName = user
    ? user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
    : 'Signing In...';

  const displayEmail = user?.primaryEmailAddress?.emailAddress || '';

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

      {/* Right Controls: Role Switcher & Real Authenticated User Profile */}
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
            Active Role:
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

        {/* Real Authenticated User Badge & Clerk UserButton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {displayName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
              <ShieldCheck size={12} color="var(--gold-dark)" />
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{role}</span>
              {displayEmail && <span style={{ opacity: 0.7 }}>&bull; {displayEmail}</span>}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              padding: '2px',
              border: '2px solid var(--gold-primary)',
              backgroundColor: '#ffffff'
            }}
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: { width: '34px', height: '34px' }
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
