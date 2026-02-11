'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import InventoryIngresoForm from '@/components/InventoryIngresoForm';
import InventoryList from '@/components/InventoryList';
import TransitManagementBoard from '@/components/TransitManagementBoard';
import TraceabilitySearch from '@/components/TraceabilitySearch';
import { useAuthStore } from '@/store/authStore';

type TabType = 'ingreso' | 'transit' | 'traceability' | 'list';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('ingreso');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-1200 mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">
                Acceso denegado. Solo administradores pueden acceder a esta página.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'list', label: 'Listado', icon: '🧾' },
    { id: 'ingreso', label: 'Ingreso de Mercadería', icon: '📦' },
    { id: 'transit', label: 'Administración de Tránsito', icon: '✈️' },
    { id: 'traceability', label: 'Trazabilidad', icon: '🔍' },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Inventario</h1>
            <p className="text-gray-600">
              Administra productos, ingresos de mercadería y trazabilidad
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 whitespace-nowrap font-medium rounded-t-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'list' && <InventoryList />}
          {activeTab === 'ingreso' && <InventoryIngresoForm />}
          {activeTab === 'transit' && <TransitManagementBoard />}
          {activeTab === 'traceability' && <TraceabilitySearch />}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📚 Flujo de Trabajo:</h3>
            <div className="text-blue-800 space-y-3">
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <p>
                  <strong>Listado:</strong> Visualiza productos, edita datos y gestiona ventas
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <p>
                  <strong>Ingreso de Mercadería:</strong> Registra la entrada (Local o Internacional)
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <p>
                  <strong>Liquidación (si es Internacional):</strong> Ingresa aduanas/flete y serial para marcar como disponible
                </p>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <p>
                  <strong>Trazabilidad:</strong> Busca cualquier producto por Serial Number para ver su historial completo
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
