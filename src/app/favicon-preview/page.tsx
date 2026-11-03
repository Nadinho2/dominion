'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FaviconPreviewPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const options = [
    {
      id: 1,
      title: 'Option 1: The Regal Heraldic Shield',
      src: '/favicons/option1.jpg',
      badge: 'Classic Academic Heritage',
      description:
        'A sleek, modern heraldic shield crest featuring an embossed golden crown, open book of knowledge, and a four-point star of excellence on Deep Oxford Navy.'
    },
    {
      id: 2,
      title: 'Option 2: The Geometric Monogram "D"',
      src: '/favicons/option2.jpg',
      badge: 'Modern Luxury Monogram',
      description:
        'A bold, luxury geometric monogram of the letter "D" crafted with polished gold ribbons and laurel accents within a thin gold perimeter ring.'
    },
    {
      id: 3,
      title: 'Option 3: The Torch & Laurel of Victory',
      src: '/favicons/option3.jpg',
      badge: 'Excellence & Distinction',
      description:
        'A sculpted golden torch of wisdom framed by a symmetrical golden laurel wreath of champions on Deep Oxford Navy.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#061224', color: '#f8fafc', padding: '3rem 1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ color: '#f3be58', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Dominion International School
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.75rem' }}>
            Choose Your Official Favicon Design
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Select your preferred concept below to set it as the official browser favicon and mobile app icon.
          </p>
        </div>

        {/* 3 Grid Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                backgroundColor: '#0a1d37',
                border: selected === opt.id ? '3px solid #f3be58' : '1px solid rgba(212, 154, 55, 0.25)',
                borderRadius: '16px',
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: selected === opt.id ? '0 0 25px rgba(243, 190, 88, 0.35)' : 'none'
              }}
            >
              <div>
                <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#030a14', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={opt.src}
                    alt={opt.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'inline-block', backgroundColor: 'rgba(212, 154, 55, 0.15)', color: '#f3be58', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  {opt.badge}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem' }}>
                  {opt.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                  {opt.description}
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    backgroundColor: selected === opt.id ? '#f3be58' : 'rgba(255, 255, 255, 0.08)',
                    color: selected === opt.id ? '#061224' : '#ffffff'
                  }}
                >
                  {selected === opt.id ? '✓ Selected (Option ' + opt.id + ')' : 'Choose Option ' + opt.id}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Banner */}
        {selected && (
          <div style={{ textAlign: 'center', backgroundColor: '#0f294d', border: '1px solid #d49a37', borderRadius: '12px', padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3be58', marginBottom: '0.35rem' }}>
              You chose Option {selected}!
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 1rem' }}>
              Tell Antigravity in the chat: <em>&ldquo;Let&apos;s go with Option {selected}&rdquo;</em> to apply it across the app.
            </p>
            <Link
              href="/dashboard"
              style={{ color: '#f3be58', textDecoration: 'underline', fontSize: '0.85rem' }}
            >
              &larr; Return to Dashboard
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

