'use client';

import React, { useEffect } from 'react';
import StudentView from '../../components/dashboard/StudentView';
import { useSchoolStore } from '../../lib/store';

export default function StudentPortalPage() {
  const { changeRole, role } = useSchoolStore();

  useEffect(() => {
    if (role !== 'student') {
      changeRole('student');
    }
  }, [role]);

  return <StudentView />;
}

