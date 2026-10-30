'use client';

import React, { useEffect } from 'react';
import AdminView from '../../components/dashboard/AdminView';
import { useSchoolStore } from '../../lib/store';

export default function AdminPortalPage() {
  const { changeRole, role } = useSchoolStore();

  useEffect(() => {
    if (role !== 'admin') {
      changeRole('admin');
    }
  }, [role]);

  return <AdminView />;
}

