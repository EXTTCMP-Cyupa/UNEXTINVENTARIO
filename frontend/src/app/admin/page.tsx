'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle, KPI, Badge } from '@/components/ui';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface DashboardStats {
  totalProducts: number;
  comprado: number;
  preparacion: number;
  enTransito: number;
  stockLocal: number;
  disponible: number;
  vendido: number;
  totalInversion: number;
  valorDisponible: number;
  gananciaPotencial: number;
  ventasRealizadas: number;
  ingresosVentas: number;
}

interface InventoryItem {
  id: number;
  productName: string;
  brand: string;
  status: string;
  costFob: number;
  costShipping: number;
  costCustoms: number;
  priceB2B: number;
  pricePVP: number;
  customerName?: string;
  salePrice?: number;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    comprado: 0,
    preparacion: 0,
    enTransito: 0,
    stockLocal: 0,
    disponible: 0,
    vendido: 0,
    totalInversion: 0,
    valorDisponible: 0,
    gananciaPotencial: 0,
    ventasRealizadas: 0,
    ingresosVentas: 0,
  });
  const [recentSales, setRecentSales] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const inventoryResponse = await api.get('/products/inventory/list');
      const items: InventoryItem[] = inventoryResponse.data || [];

      // Contar por estado
      const comprado = items.filter((i) => i.status === 'COMPRADO').length;
      const preparacion = items.filter((i) => i.status === 'PREPARACION_ENVIO').length;
      const enTransito = items.filter((i) => i.status === 'EN_TRANSITO').length;
      const stockLocal = items.filter((i) => i.status === 'STOCK_LOCAL').length;
      const disponible = items.filter((i) => i.status === 'DISPONIBLE').length;
      const vendido = items.filter((i) => i.status === 'VENDIDO').length;

      // Calcular inversión total (todos los productos)
      const totalInversion = items.reduce(
        (sum, i) => sum + (i.costFob + (i.costShipping || 0) + (i.costCustoms || 0)),
        0
      );

      // Valor de productos disponibles (PVP)
      const disponibleItems = items.filter((i) => i.status === 'DISPONIBLE');
      const valorDisponible = disponibleItems.reduce((sum, i) => sum + (i.pricePVP || 0), 0);

      // Ganancia potencial de disponibles
      const gananciaPotencial = disponibleItems.reduce((sum, i) => {
        const landedCost = i.costFob + (i.costShipping || 0) + (i.costCustoms || 0);
        return sum + ((i.pricePVP || 0) - landedCost);
      }, 0);

      // Ventas realizadas
      const ventasItems = items.filter((i) => i.status === 'VENDIDO');
      const ingresosVentas = ventasItems.reduce((sum, i) => sum + (i.salePrice || i.pricePVP || 0), 0);

      setStats({
        totalProducts: items.length,
        comprado,
        preparacion,
        enTransito,
        stockLocal,
        disponible,
        vendido,
        totalInversion,
        valorDisponible,
        gananciaPotencial,
        ventasRealizadas: vendido,
        ingresosVentas,
      });

      // Últimas 5 ventas
      setRecentSales(
        ventasItems
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
      );

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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
          <p className="text-gray-600 mt-1">Vista general del inventario y ventas</p>
        </div>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Total Productos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">En todo el sistema</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Inversión Total</p>
                  <p className="text-3xl font-bold text-orange-700 mt-2">
                    ${stats.totalInversion.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Costo de inventario</p>
                </div>
                <div className="text-4xl">💵</div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Disponibles</p>
                  <p className="text-3xl font-bold text-teal-700 mt-2">{stats.disponible}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor: ${stats.valorDisponible.toFixed(2)}
                  </p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">Ingresos Ventas</p>
                  <p className="text-3xl font-bold text-green-700 mt-2">
                    ${stats.ingresosVentas.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.vendido} productos vendidos</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estados del Inventario */}
        <Card>
          <CardHeader>
            <CardTitle>Estado del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🛒</span>
                  <span className="text-2xl font-bold text-blue-700">{stats.comprado}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">COMPRADO</p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📋</span>
                  <span className="text-2xl font-bold text-yellow-700">{stats.preparacion}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">PREPARACIÓN</p>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✈️</span>
                  <span className="text-2xl font-bold text-orange-700">{stats.enTransito}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">EN TRÁNSITO</p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📦</span>
                  <span className="text-2xl font-bold text-purple-700">{stats.stockLocal}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">STOCK LOCAL</p>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-2xl font-bold text-teal-700">{stats.disponible}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">DISPONIBLE</p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-2xl font-bold text-green-700">{stats.vendido}</span>
                </div>
                <p className="text-xs font-semibold text-gray-700">VENDIDO</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Ventas Recientes */}
          <Card hover className="xl:col-span-2">
            <CardHeader>
              <CardTitle>💰 Ventas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-5xl mb-3">🛒</div>
                  <p>No hay ventas registradas aún</p>
                  <a
                    href="/admin/sales"
                    className="inline-block mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold"
                  >
                    Registrar Primera Venta
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSales.map((sale) => {
                    const landedCost =
                      sale.costFob + (sale.costShipping || 0) + (sale.costCustoms || 0);
                    const salePrice = sale.salePrice || sale.pricePVP || 0;
                    const profit = salePrice - landedCost;

                    return (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{sale.productName}</p>
                          <p className="text-sm text-gray-600">{sale.brand}</p>
                          {sale.customerName && (
                            <p className="text-xs text-gray-500 mt-1">
                              Cliente: {sale.customerName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700 text-lg">
                            ${salePrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ganancia: ${profit.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(sale.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alertas y Resumen Financiero */}
          <div className="space-y-6">
            <Card hover>
              <CardHeader>
                <CardTitle>💡 Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 uppercase">Inversión</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">
                      ${stats.totalInversion.toFixed(2)}
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 uppercase">
                      Valor Disponible
                    </p>
                    <p className="text-2xl font-bold text-teal-700 mt-1">
                      ${stats.valorDisponible.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{stats.disponible} productos</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 uppercase">
                      Ganancia Potencial
                    </p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      ${stats.gananciaPotencial.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">De productos disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card hover>
              <CardHeader>
                <CardTitle>⚠️ Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.enTransito > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-600 text-xl">✈️</span>
                        <div>
                          <p className="text-sm font-semibold text-orange-900">En Tránsito</p>
                          <p className="text-xs text-orange-700">
                            {stats.enTransito} productos en camino
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.stockLocal > 0 && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 text-xl">📦</span>
                        <div>
                          <p className="text-sm font-semibold text-purple-900">Stock Local</p>
                          <p className="text-xs text-purple-700">
                            {stats.stockLocal} productos pendientes de disponibilidad
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.disponible === 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-600 text-xl">⚠️</span>
                        <div>
                          <p className="text-sm font-semibold text-yellow-900">Sin Stock</p>
                          <p className="text-xs text-yellow-700">
                            No hay productos disponibles para venta
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {stats.enTransito === 0 && stats.stockLocal === 0 && stats.disponible > 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-3xl mb-2">✅</p>
                      <p className="text-sm font-semibold">Todo en orden</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/admin/inventory"
                className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">📦</span>
                <div>
                  <p className="font-semibold text-blue-900">Gestionar Inventario</p>
                  <p className="text-xs text-blue-700">Ver todos los productos</p>
                </div>
              </a>

              <a
                href="/admin/sales"
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">💰</span>
                <div>
                  <p className="font-semibold text-green-900">Realizar Venta</p>
                  <p className="text-xs text-green-700">{stats.disponible} disponibles</p>
                </div>
              </a>

              <a
                href="/admin/products-analysis"
                className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
                <div>
                  <p className="font-semibold text-purple-900">Análisis Financiero</p>
                  <p className="text-xs text-purple-700">Ver costos y márgenes</p>
                </div>
              </a>

              <a
                href="/warranty"
                className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">🔍</span>
                <div>
                  <p className="font-semibold text-yellow-900">Buscar Garantía</p>
                  <p className="text-xs text-yellow-700">Por número de serie</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
