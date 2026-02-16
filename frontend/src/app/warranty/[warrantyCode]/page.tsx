'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { api } from '@/services/api';

interface PublicWarranty {
  productName: string;
  brand: string;
  customerName: string;
  warrantyCode: string;
  warrantyType: string;
  status: string; // PENDIENTE, ACTIVA, VENCIDA
  warrantyStartDate: string | null;
  warrantyEndDate: string | null;
  saleType: string; // NORMAL, ANTICIPADA
  message: string;
}

export default function PublicWarrantyPage() {
  const params = useParams();
  const warrantyCode = params.warrantyCode as string;
  const [warranty, setWarranty] = useState<PublicWarranty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (warrantyCode) {
      fetchWarranty();
    }
  }, [warrantyCode]);

  const fetchWarranty = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/warranty/public/${warrantyCode}`);
      setWarranty(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se encontró información de garantía para este código');
      console.error('Error fetching warranty:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Badge variant="warning" size="md">⏳ PENDIENTE</Badge>;
      case 'ACTIVA':
        return <Badge variant="success" size="md">✅ ACTIVA</Badge>;
      case 'VENCIDA':
        return <Badge variant="default" size="md">❌ VENCIDA</Badge>;
      default:
        return <Badge variant="default" size="md">{status}</Badge>;
    }
  };

  const getWarrantyTypeLabel = (type: string) => {
    switch (type) {
      case 'SIN_GARANTIA':
        return 'Sin Garantía';
      case '1_MES':
        return '1 Mes';
      case '6_MESES':
        return '6 Meses';
      case '12_MESES':
        return '12 Meses (1 Año)';
      default:
        return type;
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">🔒 Garantía de Producto</h1>
            <p className="text-gray-600 text-lg">Consulta pública de garantía</p>
            <p className="text-sm text-gray-500 font-mono mt-2">Código: {warrantyCode}</p>
          </div>

          {loading && (
            <Card className="shadow-xl">
              <CardContent className="py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4"></div>
                  <p className="text-gray-600 text-lg">Cargando información de garantía...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200 bg-red-50 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold text-red-800 mb-2">Garantía No Encontrada</h2>
                  <p className="text-red-700 text-lg">{error}</p>
                  <p className="text-red-600 text-sm mt-3">
                    Verifica que el código de garantía sea correcto o contacta con el vendedor.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {warranty && (
            <div className="space-y-6">
              {/* Status Banner */}
              <Card className={`shadow-xl border-2 ${
                warranty.status === 'PENDIENTE'
                  ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50'
                  : warranty.status === 'ACTIVA'
                  ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50'
                  : 'border-gray-400 bg-gradient-to-r from-gray-50 to-slate-50'
              }`}>
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="mb-4">{getStatusBadge(warranty.status)}</div>
                    <div className={`text-xl font-semibold mb-2 ${
                      warranty.status === 'PENDIENTE'
                        ? 'text-amber-900'
                        : warranty.status === 'ACTIVA'
                        ? 'text-green-900'
                        : 'text-gray-900'
                    }`}>
                      {warranty.message}
                    </div>
                    {warranty.saleType === 'ANTICIPADA' && warranty.status === 'PENDIENTE' && (
                      <div className="mt-4 p-4 bg-amber-100 border border-amber-300 rounded-lg">
                        <p className="text-amber-900 font-medium">
                          🚀 <strong>Venta Anticipada:</strong> Este producto fue vendido durante el tránsito.
                          <br />La garantía comenzará automáticamente cuando el producto llegue al local.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <h2 className="text-2xl font-bold">📦 Información del Producto</h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Producto</p>
                      <p className="text-xl font-bold text-blue-900">{warranty.productName}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Marca</p>
                      <p className="text-xl font-bold text-purple-900">{warranty.brand}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <h2 className="text-2xl font-bold">👤 Cliente</h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-teal-50 rounded-lg p-5 border border-teal-200">
                    <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">Nombre</p>
                    <p className="text-xl font-bold text-teal-900">{warranty.customerName}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Warranty Details */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <h2 className="text-2xl font-bold">📋 Detalles de Garantía</h2>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">Código de Garantía</p>
                        <p className="text-lg font-mono font-bold text-indigo-900 break-all">{warranty.warrantyCode}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Tipo de Garantía</p>
                        <p className="text-lg font-bold text-purple-900">{getWarrantyTypeLabel(warranty.warrantyType)}</p>
                      </div>
                    </div>

                    {warranty.status === 'ACTIVA' && warranty.warrantyStartDate && warranty.warrantyEndDate && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Fecha de Inicio</p>
                          <p className="text-lg font-bold text-green-900">
                            {new Date(warranty.warrantyStartDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-5 border border-red-200">
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Válida Hasta</p>
                          <p className="text-lg font-bold text-red-900">
                            {new Date(warranty.warrantyEndDate).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {warranty.status === 'VENCIDA' && warranty.warrantyEndDate && (
                      <div className="bg-gray-100 rounded-lg p-5 border border-gray-300 mt-4">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Fecha de Vencimiento</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(warranty.warrantyEndDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Esta garantía ha expirado.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Help Card */}
              <Card className="shadow-xl border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📞</div>
                    <h3 className="text-lg font-bold text-blue-900 mb-2">¿Necesitas Ayuda?</h3>
                    <p className="text-blue-800">
                      Si tienes alguna pregunta sobre tu garantía o necesitas hacer un reclamo,
                      <br />contacta con nuestro equipo de soporte.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
