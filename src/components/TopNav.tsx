'use client';

import React, { useEffect } from 'react';
import { UserRole } from '../lib/types';
import { useSchoolStore } from '../lib/store';
import { useUser, UserButton } from '@clerk/nextjs';
import { BellRing, Sparkles, ShieldCheck, Menu } from 'lucide-react';

interface TopNavProps {
  onToggleMenu?: () => void;
}

export default function TopNav({ onToggleMenu }: TopNavProps) {
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
    <header className="top-nav-header no-print">
      {/* Left Academic Session Badge & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onToggleMenu && (
          <button
            onClick={onToggleMenu}
            className="mobile-menu-btn"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--gold-badge)',
              border: '1px solid var(--gold-border)',
              fontSize: '0.725rem',
              fontWeight: 700,
              color: '#854d0e'
            }}
          >
            <Sparkles size={13} color="#d97706" />
            <span>2026/2027 &bull; 1st Term</span>
          </div>
          <div className="campus-label" style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Ajao Estate Campus
          </div>
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
