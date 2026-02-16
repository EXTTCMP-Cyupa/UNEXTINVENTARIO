'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { reportService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { SalesReportDTO, SalesSummaryDTO, InventoryReportDTO } from '@/types';

export default function ReportsPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const initAuthRef = useRef(false);
  
  // State para reportes
  const [salesSummary, setSalesSummary] = useState<SalesSummaryDTO | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventoryReportDTO | null>(null);
  const [salesList, setSalesList] = useState<SalesReportDTO[]>([]);
  const [paymentMethodsDistribution, setPaymentMethodsDistribution] = useState<Record<string, number>>({});

  // Filtros
  const [activeTab, setActiveTab] = useState<'summary' | 'sales-list' | 'inventory'>('summary');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [warrantyTypeFilter, setWarrantyTypeFilter] = useState('');

  useEffect(() => {
    // Only initialize auth once
    if (!initAuthRef.current) {
      initAuthRef.current = true;
      initAuth();
    }
    setMounted(true);
  }, [initAuth]);

  // Separate effect for loading reports based on user
  useEffect(() => {
    if (!mounted) return;

    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    loadReports();
  }, [mounted, user, router]);

  const loadReports = async () => {
    setLoading(true);
    try {
      // Cargar resúmenes
      const summary = await reportService.getSalesSummary();
      setSalesSummary(summary);

      const inventory = await reportService.getInventorySummary();
      setInventorySummary(inventory);

      // Cargar distribución de métodos de pago
      const distribution = await reportService.getPaymentMethodsDistribution();
      setPaymentMethodsDistribution(distribution || {});

      // Cargar lista de ventas
      const sales = await reportService.getSalesReport();
      setSalesList(sales);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    try {
      const sales = await reportService.getSalesReport(
        customerNameFilter || undefined,
        paymentMethodFilter || undefined,
        warrantyTypeFilter || undefined
      );
      setSalesList(sales);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    }
  };

  const handleClearFilters = () => {
    setCustomerNameFilter('');
    setPaymentMethodFilter('');
    setWarrantyTypeFilter('');
    loadReports();
  };

  if (!mounted) return null;

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-600 mt-1">Análisis y estadísticas del sistema</p>
          </div>
          <button
            onClick={loadReports}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Resumen
          </button>
          <button
            onClick={() => setActiveTab('sales-list')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'sales-list'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💰 Ventas
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Inventario
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reportes...</p>
            </div>
          </div>
        ) : (
          <>
            {/* TAB: Resumen */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* KPIs Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Total Ventas</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                          {salesSummary?.totalSales || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          ${(salesSummary?.totalRevenue || 0).toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Precio Promedio</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                          ${(salesSummary?.averageSalePrice || 0).toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Garantías Creadas</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">
                          {salesSummary?.warrantiesCreated || 0}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métodos de Pago */}
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Métodos de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(paymentMethodsDistribution).map(([method, count]) => (
                        <div key={method} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-600 text-sm font-medium">{method}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {salesSummary?.totalSales ? ((count / salesSummary.totalSales) * 100).toFixed(1) : 0}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Métodos de Pago & Garantías */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Método de Pago Más Usado</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {salesSummary?.topPaymentMethod || 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Garantía Más Popular</p>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {salesSummary?.topWarrantyType || 'N/A'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB: Listado de Ventas */}
            {activeTab === 'sales-list' && (
              <div className="space-y-6">
                {/* Filtros */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre del cliente"
                        value={customerNameFilter}
                        onChange={(e) => setCustomerNameFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <select
                        value={paymentMethodFilter}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Todos los métodos de pago</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                      </select>
                      <select
                        value={warrantyTypeFilter}
                        onChange={(e) => setWarrantyTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Todos los tipos de garantía</option>
                        <option value="3_MESES">3 Meses</option>
                        <option value="6_MESES">6 Meses</option>
                        <option value="12_MESES">12 Meses</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleApplyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Aplicar Filtros
                      </button>
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Limpiar
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla de Ventas */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">ID Venta</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Cliente</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Producto</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Precio</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Método Pago</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Garantía</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Fecha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesList.length > 0 ? (
                            salesList.map((sale, idx) => (
                              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-3 text-gray-900 font-medium">{sale.saleId}</td>
                                <td className="px-6 py-3 text-gray-600">{sale.customerName}</td>
                                <td className="px-6 py-3 text-gray-600">{sale.productName}</td>
                                <td className="px-6 py-3 text-gray-900 font-semibold">P${sale.salePrice.toFixed(2)}</td>
                                <td className="px-6 py-3">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {sale.paymentMethod}
                                  </span>
                                </td>
                                <td className="px-6 py-3">{sale.warrantyType || 'N/A'}</td>
                                <td className="px-6 py-3 text-gray-500 text-xs">
                                  {new Date(sale.saleDate).toLocaleDateString('es-ES')}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                No hay ventas registradas
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB: Inventario */}
            {activeTab === 'inventory' && inventorySummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Total Productos</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                          {inventorySummary.totalProducts}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Disponibles</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          {inventorySummary.productsAvailable}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">En Tránsito</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">
                          {inventorySummary.productsInTransit}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Stock Bajo (>90 días)</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                          {inventorySummary.lowStockCount}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Promedio días en stock</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                          {inventorySummary.averageDaysInStock.toFixed(1)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm font-medium">Valor Total Inventario</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          ${inventorySummary.totalInventoryValue.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
