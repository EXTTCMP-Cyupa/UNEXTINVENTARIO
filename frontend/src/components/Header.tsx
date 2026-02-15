'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const { isAuthenticated, user, logout, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                FIXME Inventory
              </div>
              <div className="text-xs text-gray-500 -mt-0.5">Sistema de Gestión</div>
            </div>
          </Link>

          <nav className="flex gap-1 items-center">
            <Link 
              href="/catalog" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              🛍️ Catálogo
            </Link>

            {mounted && isAuthenticated && user?.role === 'ADMIN' && (
              <>
                <Link 
                  href="/admin" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  📊 Dashboard
                </Link>
                <Link 
                  href="/admin/products-analysis" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  📦 Productos
                </Link>
              </>
            )}

            <Link 
              href="/warranty" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              🔒 Garantía
            </Link>

            <div className="ml-2 pl-2 border-l border-gray-200">
              {mounted && (!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ml-1"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors ml-2"
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                      <div className="text-xs text-gray-500">{user?.role}</div>
                    </div>
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm font-medium text-red-700 hover:text-white hover:bg-red-600 border border-red-300 hover:border-red-600 rounded-lg transition-colors"
                    >
                      Salir
                    </button>
                  </div>
                </>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
