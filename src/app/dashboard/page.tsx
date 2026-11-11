'use client';

import React, { useEffect } from 'react';
import { useSchoolStore } from '../../lib/store';
import { useUser } from '@clerk/nextjs';
import { UserRole } from '../../lib/types';
import AdminView from '../../components/dashboard/AdminView';
import TeacherView from '../../components/dashboard/TeacherView';
import ParentView from '../../components/dashboard/ParentView';
import StudentView from '../../components/dashboard/StudentView';

export default function DashboardOverviewPage() {
  const { role, isLoaded: isStoreLoaded, changeRole } = useSchoolStore();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Strictly sync role from Clerk authenticated user metadata
  useEffect(() => {
    if (isUserLoaded && user) {
      const isSuperAdminEmail = user.primaryEmailAddress?.emailAddress === 'nnamdiamuchie@gmail.com';
      const existingRole = user.publicMetadata?.role as UserRole | undefined;
      const targetRole: UserRole = existingRole || (isSuperAdminEmail ? 'admin' : 'parent');
      if (targetRole !== role) {
        changeRole(targetRole);
      }
    }
  }, [isUserLoaded, user, role, changeRole]);

  if (!isStoreLoaded || !isUserLoaded) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading Dominion SMS Portal...</div>
      </div>
    );
  }

  const isSuperAdminEmail = user?.primaryEmailAddress?.emailAddress === 'nnamdiamuchie@gmail.com';
  const effectiveRole: UserRole = (user?.publicMetadata?.role as UserRole) || 
    (isSuperAdminEmail ? 'admin' : 'parent');

  return (
    <div>
      {effectiveRole === 'admin' && <AdminView />}
      {effectiveRole === 'teacher' && <TeacherView />}
      {effectiveRole === 'parent' && <ParentView />}
      {effectiveRole === 'student' && <StudentView />}
    </div>
  );
}
