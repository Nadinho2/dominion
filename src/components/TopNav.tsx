'use client';

import React, { useEffect } from 'react';
import { UserRole } from '../lib/types';
import { useSchoolStore } from '../lib/store';
import { useUser, UserButton } from '@clerk/nextjs';
import { BellRing, Sparkles, ShieldCheck } from 'lucide-react';

export default function TopNav() {
  const { role, changeRole } = useSchoolStore();
  const { user, isLoaded } = useUser();

  // Strictly sync role from Clerk authenticated user metadata
  useEffect(() => {
    if (isLoaded && user) {
      const clerkRole = (user.publicMetadata?.role as UserRole) || 
        (user.organizationMemberships?.[0]?.role === 'org:admin' ? 'admin' : null);
      if (clerkRole && clerkRole !== role) {
        changeRole(clerkRole);
      }
    }
  }, [isLoaded, user, role, changeRole]);

  const displayName = user
    ? user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
    : 'Authenticated User';

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

      {/* Right Controls: Real Authenticated User Profile & Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
