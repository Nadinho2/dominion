'use client';

import React, { useEffect } from 'react';
import ParentView from '../../components/dashboard/ParentView';
import { useSchoolStore } from '../../lib/store';

export default function ParentPortalPage() {
  const { changeRole, role } = useSchoolStore();

  useEffect(() => {
    if (role !== 'parent') {
      changeRole('parent');
    }
  }, [role]);

  return <ParentView />;
}

