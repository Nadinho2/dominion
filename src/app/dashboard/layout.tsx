'use client';

import React from 'react';
import PortalLayout from '../../components/PortalLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout>{children}</PortalLayout>;
}

