'use client';

import Header from '@/components/Header';
import { useState } from 'react';
import { warrantyService } from '@/services/api';
import { WarrantyHistory } from '@/types';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';

export default function WarrantyPage() {
  const [serialNumber, setSerialNumber] = useState('');
  const [warranty, setWarranty] = useState<WarrantyHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWarranty(null);

    try {
      const data = await warrantyService.getWarrantyHistory(serialNumber);
      setWarranty(data);
    } catch (err) {
      setError('No se encontró información de garantía para este Serial o Código');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F6F8FB] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔒 Consulta de Garantía</h1>
            <p className="text-gray-600">Verifica el estado y detalles de garantía de tu producto</p>
          </div>

          {/* Search Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="🔍 Ingrese Serial o Código FIX-XXXXX"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="flex-1 px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    {loading ? 'Buscando...' : '🔍 Buscar'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-700">
                  <span className="text-2xl">⚠️</span>
                  <p className="font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {warranty && (
            <div className="space-y-6">
              {/* Main Info Card */}
              <Card hover>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-purple-900">Información del Producto</h2>
                      <p className="text-purple-700 text-sm mt-1">Historial completo de garantía</p>
                    </div>
                    {warranty.status === 'DISPONIBLE' && <Badge variant="success" size="md">DISPONIBLE</Badge>}
                    {warranty.status === 'VENDIDO' && <Badge variant="info" size="md">VENDIDO</Badge>}
                    {warranty.status === 'RESERVADO' && <Badge variant="warning" size="md">RESERVADO</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Número de Serie</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{warranty.serialNumber}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Código Interno</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{warranty.internalCode}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Producto</p>
                      <p className="text-lg font-semibold text-gray-900">{warranty.productName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Marca</p>
                      <p className="text-lg font-semibold text-gray-900">{warranty.brand || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Modelo</p>
                      <p className="text-lg font-semibold text-gray-900">{warranty.model || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Estado</p>
                      <p className={`text-lg font-semibold ${
                        warranty.status === 'DISPONIBLE' ? 'text-green-600' :
                        warranty.status === 'VENDIDO' ? 'text-blue-600' :
                        'text-gray-900'
                      }`}>
                        {warranty.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warranty Details */}
              <Card hover>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">📅 Detalles de Garantía</h3>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-1">Garantía Válida Hasta</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {warranty.warrantyEndDate
                          ? new Date(warranty.warrantyEndDate).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })
                          : 'No disponible'}
                      </p>
                    </div>
                    
                    {warranty.saleDate && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Fecha de Venta</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {new Date(warranty.saleDate).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}

                    {warranty.customerName && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Cliente</p>
                        <p className="text-lg font-semibold text-green-900">{warranty.customerName}</p>
                      </div>
                    )}

                    {warranty.qrToken && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Token QR</p>
                        <p className="text-xs font-mono text-gray-600 break-all">{warranty.qrToken}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Price Info */}
              {warranty.salePrice && (
                <Card hover className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-2">Precio de Venta</p>
                        <p className="text-4xl font-bold text-green-600">
                          ${warranty.salePrice.toFixed(2)}
                        </p>
                        {warranty.landedCost && (
                          <p className="text-sm text-green-700 mt-2">
                            Costo real: ${warranty.landedCost.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <span className="text-6xl">💰</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {!warranty && !error && !loading && (
            <Card>
              <CardContent className="py-16 text-center">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Busca tu garantía</h3>
                <p className="text-gray-600">Ingresa el número de serie o código del producto</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
