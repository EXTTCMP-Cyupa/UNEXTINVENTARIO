'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const { isAuthenticated, user, logout, initAuth } = useAuthStore();
  const { items } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <header className="sticky top-0 z-50 border-b border-blue-950/40 bg-gradient-to-r from-[#06122a] via-[#0a1b3f] to-[#111b48] text-white shadow-xl">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white lg:hidden"
              aria-label="Abrir menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 font-bold text-white shadow-md">
                F
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold tracking-tight group-hover:text-blue-200">FIXME Inventory</div>
                <div className="truncate text-xs text-blue-100/80">Sistema de Gestion</div>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="Buscar por producto, marca o categoria"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="h-11 w-full rounded-2xl border border-white/20 bg-white/95 pl-11 pr-4 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-500 focus:border-blue-300"
              />
              <svg className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.2-5.2m1.7-4.8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>

              {searchFocused && (
                <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-xl">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sugerencias rapidas</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {['Laptops', 'Componentes', 'Ofertas', 'Marca', 'Apple', 'Samsung'].map((tag) => (
                      <button key={tag} type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50">
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/warranty"
              className="hidden rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 md:inline-flex"
            >
              Consultar Garantia (Serial)
            </Link>

            <Link href="/catalog" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20" aria-label="Catalogo">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M3 10h18M3 16h18M3 22h18" />
              </svg>
            </Link>

            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20" aria-label="Carrito">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 3h12m-8 4a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {mounted && isAuthenticated ? (
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-semibold uppercase">
                  {(user?.email || 'U')[0]}
                </div>
                <div className="min-w-0 max-w-[120px]">
                  <p className="truncate text-xs font-semibold">{user?.fullName || user?.email}</p>
                  <p className="truncate text-[11px] text-blue-100/80">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg border border-red-300/60 bg-red-500/20 px-2.5 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-500/35"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/login" className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-400">
                  Iniciar sesion
                </Link>
                <Link href="/register" className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 hidden items-center gap-2 border-t border-white/10 pt-3 lg:flex">
          <Link href="/catalog" className="rounded-lg bg-blue-500/25 px-3 py-1.5 text-sm font-medium text-blue-100 hover:bg-blue-500/35">Catalogo</Link>
          <Link href="/warranty" className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-100 hover:bg-white/10">Garantia</Link>
          {mounted && isAuthenticated && user?.role === 'ADMIN' && (
            <>
              <Link href="/admin" className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-100 hover:bg-white/10">Dashboard</Link>
              <Link href="/admin/inventory" className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-100 hover:bg-white/10">Inventario</Link>
            </>
          )}
        </div>

        {mobileOpen && (
          <div className="mt-3 space-y-2 rounded-2xl border border-white/15 bg-white/10 p-3 lg:hidden">
            <input
              type="text"
              placeholder="Buscar productos"
              className="h-10 w-full rounded-xl border border-white/20 bg-white/95 px-3 text-sm text-slate-800 outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <Link href="/catalog" className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white">Catalogo</Link>
              <Link href="/warranty" className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white">Garantia</Link>
            </div>
            <Link href="/warranty" className="block rounded-lg border border-white/25 bg-white/15 px-3 py-2 text-center text-sm font-semibold text-white">
              Consultar Garantia (Serial)
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
