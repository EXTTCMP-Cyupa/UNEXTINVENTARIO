'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-accent">
          FIXME Ecosystem
        </Link>

        <nav className="flex gap-6 items-center">
          <Link href="/catalog" className="hover:text-accent transition">
            Catálogo
          </Link>

          {mounted && isAuthenticated && user?.role === 'ADMIN' && (
            <>
              <Link href="/admin/products" className="hover:text-accent transition">
                + Productos
              </Link>
              <Link href="/imports" className="hover:text-accent transition">
                Importaciones
              </Link>
            </>
          )}

          <Link href="/warranty" className="hover:text-accent transition">
            Garantía
          </Link>

          {mounted && (!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-secondary rounded hover:bg-green-700 transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border border-white rounded hover:bg-gray-700 transition"
              >
                Registrar
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm">{user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ))}
        </nav>
      </div>
    </header>
  );
}
