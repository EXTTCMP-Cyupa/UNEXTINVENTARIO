'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  group: 'general' | 'operacion' | 'analitica';
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: '📊', group: 'general' },
  { label: 'Órdenes Pendientes', href: '/admin/orders', icon: '📦', group: 'operacion' },
  { label: 'Inventario', href: '/admin/inventory', icon: '📋', group: 'operacion' },
  { label: 'Ventas', href: '/admin/sales', icon: '💰', group: 'operacion' },
  { label: 'Ventas Anticipadas', href: '/admin/anticipated-sales', icon: '🚀', group: 'operacion' },
  { label: 'Garantías', href: '/admin/warranties', icon: '🔒', group: 'operacion' },
  { label: 'Productos', href: '/admin/products-analysis', icon: '🧮', group: 'analitica' },
  { label: 'Reportes', href: '/admin/reports', icon: '📈', group: 'analitica' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const sectionLabels = {
  general: 'General',
  operacion: 'Operacion diaria',
  analitica: 'Analitica',
} as const;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const { user, logout, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const groupedItems = navItems.reduce<Record<NavItem['group'], NavItem[]>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    { general: [], operacion: [], analitica: [] }
  );

  const handleLogout = () => {
    const ok = window.confirm('¿Seguro que deseas cerrar sesion?');
    if (ok) logout();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 shadow-2xl transition-transform duration-200 md:static md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu principal del dashboard"
      >
      {/* Logo */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">FIXME Inventory</h1>
            <p className="mt-1 text-xs text-gray-400">Sistema de Gestion</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-300 hover:bg-gray-800 md:hidden"
            aria-label="Cerrar menu"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {(['general', 'operacion', 'analitica'] as const).map((section) => (
          <div key={section} className="mb-4">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {sectionLabels[section]}
            </p>
            <ul className="space-y-1.5">
              {groupedItems[section].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => onClose?.()}
                    className={`
                    flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-200
                    ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User section */}
      {mounted && user && (
        <div className="border-t border-gray-800 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              {user.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName || user.email}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
          >
            Cerrar sesión
          </button>
        </div>
      )}
      </aside>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-label="Cerrar menu lateral"
        />
      )}
    </>
  );
};
