'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBanner from '@/components/admin/AdminStatusBanner';
import { reportService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { InventoryReportDTO, SalesReportDTO, SalesSummaryDTO } from '@/types';

const currency = (value: number) => `$${(value || 0).toFixed(2)}`;

const paymentBadgeClass = (method?: string) => {
  const value = (method || '').toUpperCase();
  if (value === 'EFECTIVO') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (value === 'TRANSFERENCIA') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (value === 'TARJETA') return 'bg-violet-100 text-violet-800 border-violet-200';
  if (value === 'CREDITO') return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

const warrantyBadgeClass = (value?: string) => {
  if (value === 'SIN_GARANTIA') return 'bg-rose-100 text-rose-800 border-rose-200';
  if (value === '1_MES') return 'bg-orange-100 text-orange-800 border-orange-200';
  if (value === '6_MESES') return 'bg-blue-100 text-blue-800 border-blue-200';
  if (value === '12_MESES') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function ReportsPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const initializedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'sales' | 'inventory'>('summary');
  const [salesSummary, setSalesSummary] = useState<SalesSummaryDTO | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventoryReportDTO | null>(null);
  const [salesList, setSalesList] = useState<SalesReportDTO[]>([]);
  const [paymentMethodsDistribution, setPaymentMethodsDistribution] = useState<Record<string, number>>({});
  const [customerFilter, setCustomerFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      initAuth();
    }
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (!mounted) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    void loadReports();
  }, [mounted, user, router]);

  const loadReports = async () => {
    setLoading(true);
    const [summaryResult, inventoryResult, paymentMethodsResult, salesResult] = await Promise.allSettled([
      reportService.getSalesSummary(),
      reportService.getInventorySummary(),
      reportService.getPaymentMethodsDistribution(),
      reportService.getSalesReport(),
    ]);

    const rejectedResults = [summaryResult, inventoryResult, paymentMethodsResult, salesResult].filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    const authError = rejectedResults.find((result) => {
      const status = (result.reason as any)?.response?.status;
      return status === 401 || status === 403;
    });

    if (authError) {
      router.push('/login');
      setLoading(false);
      return;
    }

    if (summaryResult.status === 'fulfilled') setSalesSummary(summaryResult.value);
    if (inventoryResult.status === 'fulfilled') setInventorySummary(inventoryResult.value);
    if (paymentMethodsResult.status === 'fulfilled') setPaymentMethodsDistribution(paymentMethodsResult.value || {});
    if (salesResult.status === 'fulfilled') setSalesList(salesResult.value || []);

    if (rejectedResults.length > 0) {
      console.error('Errores parciales cargando reportes:', rejectedResults.map((result) => result.reason));
      setError('Algunos indicadores no se pudieron cargar.');
    } else {
      setError(null);
    }

    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  };

  const handleApplyFilters = async () => {
    try {
      const sourceSales =
        startDateFilter || endDateFilter
          ? await reportService.getSalesByDateRange(startDateFilter || undefined, endDateFilter || undefined)
          : await reportService.getSalesReport();

      const filtered = sourceSales.filter((sale) => {
        const matchesCustomer = !customerFilter.trim()
          || sale.customerName.toLowerCase().includes(customerFilter.trim().toLowerCase());
        const matchesPayment = !paymentFilter || sale.paymentMethod === paymentFilter;
        const matchesWarranty = !warrantyFilter || sale.warrantyType === warrantyFilter;
        return matchesCustomer && matchesPayment && matchesWarranty;
      });

      setSalesList(filtered);
      setError(null);
    } catch (err) {
      console.error('Error aplicando filtros:', err);
      setError('No se pudieron aplicar los filtros.');
    }
  };

  const handleClearFilters = () => {
    setCustomerFilter('');
    setPaymentFilter('');
    setWarrantyFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    void loadReports();
  };

  const paymentMethods = useMemo(
    () => Object.entries(paymentMethodsDistribution).sort((a, b) => b[1] - a[1]),
    [paymentMethodsDistribution]
  );

  const topPaymentCount = paymentMethods[0]?.[1] || 0;
  const salesTotal = salesSummary?.totalSales || 0;
  const activeWarrantySales = salesList.filter((sale) => sale.warrantyType && sale.warrantyType !== 'SIN_GARANTIA').length;
  const inventoryCoverage = inventorySummary?.totalProducts
    ? Math.round((inventorySummary.productsAvailable / inventorySummary.totalProducts) * 100)
    : 0;
  const transitShare = inventorySummary?.totalProducts
    ? Math.round((inventorySummary.productsInTransit / inventorySummary.totalProducts) * 100)
    : 0;

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              Validando acceso al panel de reportes...
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8">
          <Card>
            <CardContent className="py-12 text-center text-yellow-800">
              Acceso denegado. Solo administradores pueden ver los reportes.
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <AdminPageHeader
          title="Reportes"
          description="Analisis ejecutivo de ventas, garantias e inventario"
          lastUpdated={lastUpdated}
          onRefresh={loadReports}
          refreshing={loading}
          refreshLabel="Actualizar"
        />

        {error && (
          <AdminStatusBanner
            variant="error"
            title="Problema al cargar reportes"
            message={error}
            actionLabel="Reintentar"
            onAction={loadReports}
          />
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card hover>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total ventas</p>
              <p className="mt-2 text-3xl font-bold text-blue-700">{salesSummary?.totalSales || 0}</p>
              <p className="mt-1 text-xs text-gray-500">{activeWarrantySales} con garantía activa</p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ingresos totales</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{currency(salesSummary?.totalRevenue || 0)}</p>
              <p className="mt-1 text-xs text-gray-500">Promedio {currency(salesSummary?.averageSalePrice || 0)}</p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Disponibles</p>
              <p className="mt-2 text-3xl font-bold text-teal-700">{inventorySummary?.productsAvailable || 0}</p>
              <p className="mt-1 text-xs text-gray-500">Cobertura {inventoryCoverage}% del inventario</p>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">En tránsito</p>
              <p className="mt-2 text-3xl font-bold text-orange-700">{inventorySummary?.productsInTransit || 0}</p>
              <p className="mt-1 text-xs text-gray-500">{transitShare}% del inventario total</p>
            </CardContent>
          </Card>
        </section>

        <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-5 lg:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Lectura ejecutiva</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Vista rápida del estado operativo</h2>
                <p className="mt-2 text-sm text-slate-700">
                  Este panel resume ventas, inventario y garantías para identificar qué está vendiendo, qué está inmovilizado y qué necesita acción.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Top pago</p>
                  <p className="mt-1 font-bold text-slate-900">{salesSummary?.topPaymentMethod || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{topPaymentCount} operaciones</p>
                </div>
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Top garantía</p>
                  <p className="mt-1 font-bold text-slate-900">{salesSummary?.topWarrantyType || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{salesSummary?.warrantiesCreated || 0} creadas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('summary')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'sales' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              💰 Ventas
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              📦 Inventario
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="text-gray-600">Cargando reportes...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'summary' && (
              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribucion de metodos de pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethods.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay datos de métodos de pago.</p>
                    ) : (
                      <div className="space-y-4">
                        {paymentMethods.map(([method, count]) => {
                          const width = topPaymentCount ? Math.max(6, (count / topPaymentCount) * 100) : 6;
                          const share = salesTotal ? ((count / salesTotal) * 100).toFixed(1) : '0.0';
                          return (
                            <div key={method} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-900">{method}</span>
                                <span className="text-slate-500">{count} ventas · {share}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100">
                                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${width}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Indicadores clave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase text-gray-500">Garantias creadas</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{salesSummary?.warrantiesCreated || 0}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase text-gray-500">Promedio por venta</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{currency(salesSummary?.averageSalePrice || 0)}</p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase text-gray-500">Inventario valorizado</p>
                        <p className="mt-1 text-2xl font-bold text-slate-900">{currency(inventorySummary?.totalInventoryValue || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Filtros de ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <input
                        type="text"
                        placeholder="Nombre del cliente"
                        value={customerFilter}
                        onChange={(e) => setCustomerFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Todos los métodos de pago</option>
                        <option value="EFECTIVO">Efectivo</option>
                        <option value="TARJETA">Tarjeta</option>
                        <option value="TRANSFERENCIA">Transferencia</option>
                        <option value="CREDITO">Crédito</option>
                      </select>
                      <select
                        value={warrantyFilter}
                        onChange={(e) => setWarrantyFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Todos los tipos de garantía</option>
                        <option value="SIN_GARANTIA">Sin garantía</option>
                        <option value="1_MES">1 Mes</option>
                        <option value="3_MESES">3 Meses</option>
                        <option value="6_MESES">6 Meses</option>
                        <option value="12_MESES">12 Meses</option>
                      </select>
                      <input
                        type="date"
                        value={startDateFilter}
                        onChange={(e) => setStartDateFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <input
                        type="date"
                        value={endDateFilter}
                        onChange={(e) => setEndDateFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={handleApplyFilters}
                        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Aplicar Filtros
                      </button>
                      <button
                        onClick={handleClearFilters}
                        className="rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-900 transition-colors hover:bg-gray-300"
                      >
                        Limpiar
                      </button>
                      <div className="ml-auto rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                        {salesList.length} resultados visibles
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lista de ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50">
                          <tr>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Venta</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Cliente</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Producto</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Precio</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Pago</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Garantía</th>
                            <th className="px-5 py-3 text-left font-semibold text-gray-900">Fecha</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {salesList.length > 0 ? (
                            salesList.map((sale) => (
                              <tr key={sale.saleId} className="hover:bg-gray-50">
                                <td className="px-5 py-4 font-medium text-gray-900">
                                  <div className="flex flex-col">
                                    <span>#{sale.saleId}</span>
                                    <span className="text-xs text-gray-500">{sale.internalCode}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-gray-600">{sale.customerName}</td>
                                <td className="px-5 py-4 text-gray-600">{sale.productName}</td>
                                <td className="px-5 py-4 font-semibold text-gray-900">{currency(sale.salePrice)}</td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${paymentBadgeClass(sale.paymentMethod)}`}>
                                    {sale.paymentMethod}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${warrantyBadgeClass(sale.warrantyType)}`}>
                                    {sale.warrantyType || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-xs text-gray-500">
                                  {new Date(sale.saleDate).toLocaleDateString('es-ES')}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
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

            {activeTab === 'inventory' && inventorySummary && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">Total Productos</p>
                      <p className="mt-2 text-3xl font-bold text-blue-600">{inventorySummary.totalProducts}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">Disponibles</p>
                      <p className="mt-2 text-3xl font-bold text-green-600">{inventorySummary.productsAvailable}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">En Tránsito</p>
                      <p className="mt-2 text-3xl font-bold text-orange-600">{inventorySummary.productsInTransit}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">Stock Bajo (&gt;90 días)</p>
                      <p className="mt-2 text-3xl font-bold text-red-600">{inventorySummary.lowStockCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">Promedio días en stock</p>
                      <p className="mt-2 text-3xl font-bold text-purple-600">{inventorySummary.averageDaysInStock.toFixed(1)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 text-center">
                      <p className="text-sm font-medium text-gray-600">Valor Total Inventario</p>
                      <p className="mt-2 text-3xl font-bold text-green-600">{currency(inventorySummary.totalInventoryValue)}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Salud del inventario</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-700">Cobertura disponible</span>
                            <span className="text-gray-500">{inventoryCoverage}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-teal-500" style={{ width: `${Math.max(4, inventoryCoverage)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-700">Riesgo por tránsito</span>
                            <span className="text-gray-500">{transitShare}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-orange-500" style={{ width: `${Math.max(4, transitShare)}%` }} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Acciones recomendadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-gray-700">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                          <p className="font-semibold text-blue-900">1. Revisa ventas con garantía activa</p>
                          <p className="mt-1 text-blue-800">Compara ticket promedio y tipo de garantía para detectar patrones de rentabilidad.</p>
                        </div>
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="font-semibold text-emerald-900">2. Evalúa margen y rotación</p>
                          <p className="mt-1 text-emerald-800">Usa inventario y ventas para balancear disponibilidad contra ingresos reales.</p>
                        </div>
                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                          <p className="font-semibold text-amber-900">3. Prioriza stock lento</p>
                          <p className="mt-1 text-amber-800">El indicador de más de 90 días ayuda a evitar productos inmovilizados.</p>
                        </div>
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
