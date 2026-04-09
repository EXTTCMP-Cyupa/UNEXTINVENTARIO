'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { initAuth } = useAuthStore();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const pageTitle = useMemo(() => {
    if (!pathname) return 'Dashboard';
    if (pathname === '/admin') return 'Dashboard';
    if (pathname.includes('/inventory')) return 'Inventario';
    if (pathname.includes('/orders')) return 'Ordenes pendientes';
    if (pathname.includes('/sales')) return 'Ventas';
    if (pathname.includes('/warranties')) return 'Garantias';
    if (pathname.includes('/reports')) return 'Reportes';
    if (pathname.includes('/products-analysis')) return 'Analisis de productos';
    if (pathname.includes('/anticipated-sales')) return 'Ventas anticipadas';
    return 'Panel administrativo';
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-blue-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Saltar al contenido principal
      </a>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 md:hidden"
                aria-label="Abrir menu del dashboard"
                aria-expanded={sidebarOpen}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-900">{pageTitle}</p>
                <p className="text-xs text-gray-500">Panel de administracion</p>
              </div>
            </div>
            <span className="hidden text-xs text-gray-500 md:inline">Navegacion consistente y accesible</span>
          </div>
        </header>

        <main id="dashboard-main" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
