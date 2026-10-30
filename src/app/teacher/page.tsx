'use client';

import React, { useEffect } from 'react';
import TeacherView from '../../components/dashboard/TeacherView';
import { useSchoolStore } from '../../lib/store';

export default function TeacherPortalPage() {
  const { changeRole, role } = useSchoolStore();

  useEffect(() => {
    if (role !== 'teacher') {
      changeRole('teacher');
    }
  }, [role]);

  return <TeacherView />;
}

