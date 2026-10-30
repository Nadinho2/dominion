'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSchoolStore } from '../../lib/store';
import AdminView from '../../components/dashboard/AdminView';
import TeacherView from '../../components/dashboard/TeacherView';
import ParentView from '../../components/dashboard/ParentView';
import StudentView from '../../components/dashboard/StudentView';

export default function DashboardOverviewPage() {
  const { role, isLoaded } = useSchoolStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && role) {
      router.replace(`/${role}`);
    }
  }, [isLoaded, role, router]);

  if (!isLoaded) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Accessing your {role} portal...</div>
      </div>
    );
  }

  return (
    <div>
      {role === 'admin' && <AdminView />}
      {role === 'teacher' && <TeacherView />}
      {role === 'parent' && <ParentView />}
      {role === 'student' && <StudentView />}
    </div>
  );
}
