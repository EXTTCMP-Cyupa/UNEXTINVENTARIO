'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usePendingOrdersModal } from '@/context/PendingOrdersContext';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  modal?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Órdenes Pendientes', href: '#', icon: '📦', modal: true },
  { label: 'Productos', href: '/admin/products-analysis', icon: '📦' },
  { label: 'Inventario', href: '/admin/inventory', icon: '📋' },
  { label: 'Ventas', href: '/admin/sales', icon: '💰' },
  { label: 'Ventas Anticipadas', href: '/admin/anticipated-sales', icon: '🚀' },
  { label: 'Garantías', href: '/admin/warranties', icon: '🔒' },
  { label: 'Clientes', href: '/admin/customers', icon: '👥' },
  { label: 'Reportes', href: '/admin/reports', icon: '📈' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, initAuth } = useAuthStore();
  const { openModal } = usePendingOrdersModal();
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

  const handleNavClick = (item: NavItem) => {
    if (item.modal) {
      openModal();
    }
  };

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">FIXME Inventory</h1>
        <p className="text-xs text-gray-400 mt-1">Sistema de Gestión</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.modal ? (
                <button
                  onClick={() => handleNavClick(item)}
                  className={`
                    w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      false
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User section */}
      {mounted && user && (
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName || user.email}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
};
