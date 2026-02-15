'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};
