'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer automatically when navigating to any page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)', position: 'relative' }}>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="mobile-backdrop"
          aria-label="Close navigation overlay"
        />
      )}

      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopNav onToggleMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="main-content-container">
          {children}
        </main>
      </div>
    </div>
  );
}

