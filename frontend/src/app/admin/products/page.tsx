'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
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
  const [activeTab, setActiveTab] = useState<TabType>('list');

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
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-yellow-800">
                <p>Acceso denegado. Solo administradores pueden acceder a esta página.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'list', label: 'Listado', icon: '🧾' },
    { id: 'ingreso', label: 'Ingreso de Mercadería', icon: '📦' },
    { id: 'transit', label: 'Administración de Tránsito', icon: '✈️' },
    { id: 'traceability', label: 'Trazabilidad', icon: '🔍' },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestión de Inventario</h1>
          <p className="text-gray-600">
            Administra productos, ingresos de mercadería y trazabilidad
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 whitespace-nowrap font-medium rounded-lg transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'list' && <InventoryList />}
          {activeTab === 'ingreso' && <InventoryIngresoForm />}
          {activeTab === 'transit' && <TransitManagementBoard />}
          {activeTab === 'traceability' && <TraceabilitySearch />}
        </div>

        {/* Info Card */}
        <Card className="mt-6" hover>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">📚 Flujo de Trabajo</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Listado</p>
                  <p className="text-sm text-gray-600">Visualiza productos, edita datos y gestiona ventas</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ingreso de Mercadería</p>
                  <p className="text-sm text-gray-600">Registra la entrada (Local o Internacional)</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Liquidación</p>
                  <p className="text-sm text-gray-600">Para internacionales: ingresa aduanas/flete y serial</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-900">Trazabilidad</p>
                  <p className="text-sm text-gray-600">Busca cualquier producto por Serial Number</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
