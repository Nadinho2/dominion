'use client';

import React from 'react';
import { useSchoolStore } from '../../lib/store';
import AdminView from '../../components/dashboard/AdminView';
import TeacherView from '../../components/dashboard/TeacherView';
import ParentView from '../../components/dashboard/ParentView';
import StudentView from '../../components/dashboard/StudentView';

export default function DashboardOverviewPage() {
  const { role, isLoaded } = useSchoolStore();

  if (!isLoaded) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Loading Dominion SMS Portal...</div>
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
