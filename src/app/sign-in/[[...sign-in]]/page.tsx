'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Shield, KeyRound, LogIn } from 'lucide-react';

const ClerkSignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false }
);

export default function SignInPage() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #061224 0%, #0d213f 100%)',
        padding: '2rem'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#ffffff' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Shield size={36} color="var(--gold-light)" />
          <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.02em' }}>
            DOMINION INTERNATIONAL SCHOOL
          </span>
        </Link>
        <p style={{ color: 'var(--gold-light)', fontSize: '0.85rem', fontStyle: 'italic' }}>
          &ldquo;Dominion Through Excellence&rdquo; &bull; Management Portal Authentication
        </p>
      </div>

      {hasClerkKey ? (
        <ClerkSignIn
          appearance={{
            elements: {
              formButtonPrimary: 'btn btn-primary',
              card: 'shadow-xl'
            }
          }}
        />
      ) : (
        <div
          className="card"
          style={{
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            padding: '2.5rem 2rem',
            backgroundColor: '#ffffff',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: 'var(--gold-badge)',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}
          >
            <KeyRound size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary-navy)' }}>
            Clerk Authentication Ready
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Clerk is fully wired up! To enable live cloud sign-in, add your <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and <code>CLERK_SECRET_KEY</code> to <code>.env.local</code>.
          </p>
          <Link href="/dashboard" className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem', padding: '0.75rem' }}>
            <LogIn size={18} /> Enter Portal Directly (Dev / Demo Mode)
          </Link>
          <Link href="/" className="btn btn-outline btn-sm" style={{ width: '100%' }}>
            Return to Public School Website
          </Link>
        </div>
      )}
    </div>
  );
}
