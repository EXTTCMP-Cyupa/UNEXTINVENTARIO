'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle, KPI, Badge } from '@/components/ui';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface DashboardStats {
  totalInventory: number;
  lowStock: number;
  salesToday: number;
  activeWarranties: number;
  inTransit: number;
}

interface RecentSale {
  id: number;
  productName: string;
  customer: string;
  amount: number;
  date: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventory: 0,
    lowStock: 0,
    salesToday: 0,
    activeWarranties: 0,
    inTransit: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      // Cargar estadísticas del inventario
      const inventoryResponse = await api.get('/products/inventory/list');
      const items = inventoryResponse.data;

      const disponibles = items.filter((i: any) => i.status === 'DISPONIBLE').length;
      const enTransito = items.filter((i: any) => i.status === 'EN_TRANSITO').length;
      
      setStats({
        totalInventory: disponibles,
        lowStock: 0, // Puedes agregar lógica de bajo stock
        salesToday: 0, // Implementar endpoint de ventas
        activeWarranties: 0, // Implementar endpoint de garantías activas
        inTransit: enTransito,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center text-gray-600">Cargando dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenido al panel de control</p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <KPI
            title="Productos en Stock"
            value={stats.totalInventory}
            subtitle="Disponibles para venta"
            icon="📦"
            color="blue"
            trend={{ value: 5, label: 'vs mes anterior' }}
          />
          <KPI
            title="Bajo Stock"
            value={stats.lowStock}
            subtitle="Requieren reposición"
            icon="⚠️"
            color="yellow"
          />
          <KPI
            title="Ventas Hoy"
            value={`$${stats.salesToday}`}
            subtitle="Total del día"
            icon="💰"
            color="green"
            trend={{ value: 12, label: 'vs ayer' }}
          />
          <KPI
            title="Garantías Activas"
            value={stats.activeWarranties}
            subtitle="En vigencia"
            icon="🔒"
            color="purple"
          />
          <KPI
            title="En Tránsito"
            value={stats.inTransit}
            subtitle="Importaciones en camino"
            icon="✈️"
            color="blue"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Ventas Recientes */}
          <Card hover className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay ventas recientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{sale.productName}</p>
                        <p className="text-sm text-gray-600">{sale.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${sale.amount}</p>
                        <p className="text-xs text-gray-500">{sale.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card hover>
            <CardHeader>
              <CardTitle>Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.lowStock > 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Bajo Stock</p>
                        <p className="text-xs text-yellow-700">
                          {stats.lowStock} productos necesitan reposición
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {stats.inTransit > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">✈️</span>
                      <div>
                        <p className="text-sm font-medium text-blue-900">En Tránsito</p>
                        <p className="text-xs text-blue-700">
                          {stats.inTransit} productos en camino
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {stats.lowStock === 0 && stats.inTransit === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">✅ Todo en orden</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <a
                  href="/admin/products-analysis"
                  className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl">📦</span>
                  <span className="text-sm font-medium text-blue-900">Nuevo Ingreso</span>
                </a>
                <a
                  href="/admin/products?tab=list"
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl">💰</span>
                  <span className="text-sm font-medium text-green-900">Realizar Venta</span>
                </a>
                <a
                  href="/warranty"
                  className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-2xl">🔍</span>
                  <span className="text-sm font-medium text-purple-900">Ver Garantía</span>
                </a>
                <a
                  href="/admin/products?tab=transit"
                  className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <span className="text-2xl">✈️</span>
                  <span className="text-sm font-medium text-yellow-900">Liquidar Importación</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
