'use client';

import React from 'react';
import PortalLayout from '../../components/PortalLayout';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayout>{children}</PortalLayout>;
}

