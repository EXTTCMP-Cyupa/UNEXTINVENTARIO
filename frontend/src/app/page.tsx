'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, isAuthenticated, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-white">
          <div className="mb-4">
            <span className="inline-block px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-6">
              Sistema de Gestión Empresarial
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">FIXME Inventory</h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            ERP + Marketplace para Gestión de Tecnología e Importaciones
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            Controla tu inventario, importaciones, ventas y garantías desde un solo lugar. Sistema integral diseñado para empresas tecnológicas.
          </p>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {/* Admin Dashboard Card - Mostrar si es ADMIN */}
            {mounted && isAuthenticated && user?.role === 'ADMIN' && (
              <Link href="/admin">
                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
                  <div className="text-5xl mb-4">📊</div>
                  <h2 className="text-2xl font-semibold text-white mb-3">Dashboard</h2>
                  <p className="text-gray-300 mb-4">
                    Panel de control para gestionar inventario, ventas, importaciones y reportes
                  </p>
                  <div className="inline-flex items-center text-purple-400 font-medium group-hover:gap-2 transition-all">
                    Ir al Dashboard
                    <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Catalog Card */}
            <Link href="/catalog">
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4">🛍️</div>
                <h2 className="text-2xl font-semibold text-white mb-3">Catálogo</h2>
                <p className="text-gray-300 mb-4">
                  Explora nuestro catálogo de laptops, monitores y repuestos con precios actualizados
                </p>
                <div className="inline-flex items-center text-blue-400 font-medium group-hover:gap-2 transition-all">
                  Ver Catálogo 
                  <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </div>
              </div>
            </Link>

            {/* Admin Card - Solo para usuarios no autenticados o no admin */}
            {(!mounted || !isAuthenticated || user?.role !== 'ADMIN') && (
              <Link href="/admin">
                <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
                  <div className="text-5xl mb-4">📊</div>
                  <h2 className="text-2xl font-semibold text-white mb-3">Administración</h2>
                  <p className="text-gray-300 mb-4">
                    Panel de control para gestionar inventario, ventas, importaciones y reportes
                  </p>
                  <div className="inline-flex items-center text-purple-400 font-medium group-hover:gap-2 transition-all">
                    Ir al Dashboard
                    <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Warranty Card */}
            <Link href="/warranty">
              <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 hover:border-green-400/50 transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-2xl font-semibold text-white mb-3">Garantía</h2>
                <p className="text-gray-300 mb-4">
                  Consulta el historial completo y estado de garantía de cualquier producto
                </p>
                <div className="inline-flex items-center text-green-400 font-medium group-hover:gap-2 transition-all">
                  Buscar Garantía
                  <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20 pt-10 border-t border-white/10">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-400">Productos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">✓</div>
              <div className="text-gray-400">Control Total</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400">Acceso</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">🔐</div>
              <div className="text-gray-400">Seguro</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
