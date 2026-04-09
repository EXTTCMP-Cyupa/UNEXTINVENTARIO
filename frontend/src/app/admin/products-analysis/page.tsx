'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBanner from '@/components/admin/AdminStatusBanner';
import ProductsAnalysisTable from '@/components/ProductsAnalysisTable';
import { useAuthStore } from '@/store/authStore';

export default function ProductsAnalysisPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (mounted && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  useEffect(() => {
    if (mounted && user?.role === 'ADMIN') {
      setLastUpdated(new Date().toLocaleString());
    }
  }, [mounted, user, selectedStatus]);

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

  const statuses = [
    { value: '', label: 'Todos los Estados' },
    { value: 'COMPRADO', label: '🛒 Comprado' },
    { value: 'PREPARACION_ENVIO', label: '📋 Preparación' },
    { value: 'EN_TRANSITO', label: '✈️ En Tránsito' },
    { value: 'STOCK_LOCAL', label: '📦 Stock Local' },
    { value: 'DISPONIBLE', label: '✅ Disponible' },
    { value: 'VENDIDO', label: '💰 Vendido' },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-6 space-y-4">
          <AdminPageHeader
            title="Analisis de productos"
            description="Visualiza productos, costos, precios y margen por estado"
            lastUpdated={lastUpdated}
          />
          <AdminStatusBanner
            variant="info"
            message="Usa el filtro para reducir errores visuales y comparar estados de forma consistente."
          />
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  Estado del Producto
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex items-end">
                <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 flex-1">
                  <p className="font-semibold text-blue-900 mb-1">📊 Columnas de Análisis:</p>
                  <p className="text-xs">Costo Total (FOB + Flete + Aduana) | Precio B2B | Precio PVP | Ganancias | Margen %</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Productos */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Inventario Completo</h2>
            <p className="text-gray-600 mt-2">
              {selectedStatus ? `Productos en estado: ${statuses.find(s => s.value === selectedStatus)?.label}` : 'Todos los productos del sistema'}
            </p>
          </CardHeader>
          <CardContent>
            <ProductsAnalysisTable statusFilter={selectedStatus} />
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">📋 Explicación de Columnas</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">💰 Costo Total (Landed Cost)</p>
                  <p className="text-sm text-gray-600">Suma de: Precio FOB + Costo Flete + Costo Aduanas. Es el costo real de traer el producto al local.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">🏢 Precio B2B (Mayorista)</p>
                  <p className="text-sm text-gray-600">Precio de venta mayorista. Se ingresa al preparar el envío y no se modifica.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">👥 Precio PVP (Público)</p>
                  <p className="text-sm text-gray-600">Precio de venta público/minorista. Se ingresa al preparar el envío.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">📈 Ganancia / Margen %</p>
                  <p className="text-sm text-gray-600">Diferencia entre Precio B2B y Costo Total. El margen es el porcentaje de ganancia respecto al costo.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
