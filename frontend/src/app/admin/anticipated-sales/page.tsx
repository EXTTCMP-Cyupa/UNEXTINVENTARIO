'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBanner from '@/components/admin/AdminStatusBanner';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface AnticipatedSale {
  id: number;
  inventoryItemId: number;
  internalCode: string;
  productName: string;
  brand: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  saleDate: string;
  salePrice: number;
  paymentMethod: string;
  statusAtSale: string;
  currentStatus: string;
  warrantyCode: string;
  warrantyStatus: string;
  deliveryDate: string | null;
  profit: number;
  notes: string;
}

export default function AnticipatedSalesPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sales, setSales] = useState<AnticipatedSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      fetchAnticipatedSales();
    }
  }, [mounted, user]);

  const fetchAnticipatedSales = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products/sales/anticipated');
      setSales(response.data || []);
      setLastUpdated(new Date().toLocaleString());
    } catch (err: any) {
      console.error('Error fetching anticipated sales:', err);
      setError(err.response?.data?.message || 'Error al cargar ventas anticipadas');
    } finally {
      setLoading(false);
    }
  };

  const copyWarrantyLink = (warrantyCode: string) => {
    const link = `${window.location.origin}/warranty/${warrantyCode}`;
    navigator.clipboard.writeText(link);
    alert('✅ Link de garantía copiado al portapapeles');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_TRANSITO':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">🚢 EN TRÁNSITO</span>;
      case 'STOCK_LOCAL':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">📦 EN LOCAL</span>;
      case 'VENDIDO':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">✅ ENTREGADO</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">{status}</span>;
    }
  };

  const getWarrantyStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded">⏳ PENDIENTE</span>;
      case 'ACTIVA':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">✅ ACTIVA</span>;
      case 'VENCIDA':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">❌ VENCIDA</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">{status}</span>;
    }
  };

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-yellow-800">
                <p>Cargando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const pendingSales = sales.filter(s => s.currentStatus !== 'VENDIDO');
  const deliveredSales = sales.filter(s => s.currentStatus === 'VENDIDO');

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title="Ventas anticipadas"
          description="Productos vendidos en transito y pendientes de entrega fisica"
          lastUpdated={lastUpdated}
          onRefresh={fetchAnticipatedSales}
          refreshing={loading}
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Total Ventas Anticipadas</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">{sales.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Pendientes Entrega</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">{pendingSales.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Entregadas</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{deliveredSales.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Valor Total</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                ${sales.reduce((sum, s) => sum + s.salePrice, 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h3 className="font-bold text-purple-900 mb-2">¿Qué son las ventas anticipadas?</h3>
                <p className="text-purple-800 text-sm leading-relaxed">
                  Son ventas de productos que aún están <strong>EN_TRANSITO</strong>. La garantía queda 
                  <strong className="text-amber-700"> PENDIENTE</strong> hasta que el producto llegue al local.
                  <br />
                  Cuando confirmes que el producto llegó a <strong>STOCK_LOCAL</strong>, el sistema automáticamente:
                </p>
                <ul className="list-disc list-inside text-purple-800 text-sm mt-2 ml-4 space-y-1">
                  <li>Cambia el estado del producto a <strong className="text-green-700">VENDIDO</strong></li>
                  <li>Activa la garantía del cliente</li>
                  <li>Registra la fecha de entrega física</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Cargando ventas anticipadas...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <AdminStatusBanner
            variant="error"
            title="No pudimos cargar ventas anticipadas"
            message={error}
            actionLabel="Reintentar"
            onAction={fetchAnticipatedSales}
          />
        )}

        {!loading && sales.length === 0 && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold mb-2">No hay ventas anticipadas</h3>
                <p className="text-gray-600">
                  Las ventas de productos EN_TRANSITO aparecerán aquí
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && sales.length > 0 && (
          <>
            {/* Pending Sales */}
            {pendingSales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>⏳ Pendientes de Entrega ({pendingSales.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{sale.productName}</h3>
                              {getStatusBadge(sale.currentStatus)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {sale.brand} • <span className="font-mono">{sale.internalCode}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-700">${sale.salePrice.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              Ganancia: <span className="font-semibold text-green-600">${sale.profit.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-blue-50 rounded p-3">
                            <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Cliente</p>
                            <p className="font-semibold text-blue-900">{sale.customerName}</p>
                            {sale.customerEmail && (
                              <p className="text-xs text-blue-700 mt-1">{sale.customerEmail}</p>
                            )}
                            {sale.customerPhone && (
                              <p className="text-xs text-blue-700">{sale.customerPhone}</p>
                            )}
                          </div>

                          <div className="bg-purple-50 rounded p-3">
                            <p className="text-xs font-semibold text-purple-700 uppercase mb-1">Fecha de Venta</p>
                            <p className="font-semibold text-purple-900">
                              {new Date(sale.saleDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-purple-700 mt-1">{sale.paymentMethod}</p>
                          </div>

                          <div className="bg-amber-50 rounded p-3">
                            <p className="text-xs font-semibold text-amber-700 uppercase mb-1">Garantía</p>
                            <div className="flex items-center gap-2 mb-1">
                              {getWarrantyStatusBadge(sale.warrantyStatus)}
                            </div>
                            <button
                              onClick={() => copyWarrantyLink(sale.warrantyCode)}
                              className="text-xs text-amber-700 hover:text-amber-900 underline mt-1"
                            >
                              📋 Copiar link
                            </button>
                          </div>
                        </div>

                        {sale.notes && (
                          <div className="bg-gray-50 rounded p-3 mt-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Notas</p>
                            <p className="text-sm text-gray-800">{sale.notes}</p>
                          </div>
                        )}

                        {sale.currentStatus === 'STOCK_LOCAL' && (
                          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-green-800">✅ Producto en local - Listo para entrega</p>
                                <p className="text-sm text-green-700 mt-1">
                                  Ve a la página de "Stock Local" para confirmar la entrega al cliente
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivered Sales */}
            {deliveredSales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>✅ Entregadas ({deliveredSales.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deliveredSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="border border-green-200 bg-green-50 rounded-lg p-5"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{sale.productName}</h3>
                              {getStatusBadge(sale.currentStatus)}
                            </div>
                            <p className="text-sm text-gray-600">
                              {sale.brand} • {sale.customerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-700">${sale.salePrice.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-white rounded p-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Vendido</p>
                            <p className="text-sm text-gray-900">
                              {new Date(sale.saleDate).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <p className="text-xs font-semibold text-gray-700 uppercase mb-1">Entregado</p>
                            <p className="text-sm text-gray-900">
                              {sale.deliveryDate
                                ? new Date(sale.deliveryDate).toLocaleDateString('es-ES')
                                : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          {getWarrantyStatusBadge(sale.warrantyStatus)}
                          <button
                            onClick={() => copyWarrantyLink(sale.warrantyCode)}
                            className="text-xs text-green-700 hover:text-green-900 underline"
                          >
                            📋 Copiar link de garantía
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
