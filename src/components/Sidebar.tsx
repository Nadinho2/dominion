'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  Bus,
  Bell,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useSchoolStore } from '../lib/store';

const ALL_NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
  { name: 'Students & SIS', href: '/dashboard/students', icon: Users, roles: ['admin'] },
  { name: 'Academics & Classes', href: '/dashboard/academics', icon: GraduationCap, roles: ['admin', 'teacher'] },
  { name: 'Attendance Register', href: '/dashboard/attendance', icon: CalendarCheck, roles: ['admin', 'teacher'] },
  { name: 'Grades & Report Cards', href: '/dashboard/grades', icon: Award, roles: ['admin', 'teacher', 'parent', 'student'] },
  { name: 'Fees & Finance', href: '/dashboard/finance', icon: CreditCard, roles: ['admin', 'parent'] },
  { name: 'School Bus & Routes', href: '/dashboard/transport', icon: Bus, roles: ['admin', 'parent'] },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Bell, roles: ['admin', 'teacher', 'parent', 'student'] }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useSchoolStore();

  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--primary-navy)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
      className="no-print"
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ width: '42px', height: '42px', flexShrink: 0 }}
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
          <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em', color: '#ffffff' }}>
            Dominion <span style={{ color: 'var(--gold-light)' }}>SMS</span>
          </div>
          <div style={{ fontSize: '0.675rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Excellence &amp; Leadership
          </div>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div
        style={{
          margin: '1rem 1.25rem 0.5rem',
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(212, 154, 55, 0.12)',
          border: '1px solid rgba(212, 154, 55, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <ShieldCheck size={16} color="var(--gold-light)" />
        <div style={{ fontSize: '0.75rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase' }}>Portal View</div>
          <div style={{ fontWeight: 700, color: 'var(--gold-light)', textTransform: 'capitalize' }}>
            {role === 'admin' ? 'Principal / SuperAdmin' : `${role} Portal`}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? 'var(--accent-navy)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--gold-light)' : '#94a3b8'} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Public Portal Switcher */}
      <div
        style={{
          padding: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.8rem',
            color: '#e2e8f0',
            fontWeight: 600
          }}
        >
          <Globe size={16} />
          View School Website
        </Link>
      </div>
    </aside>
  );
}

