'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface InventoryDetail {
  id: number;
  serialNumber: string;
  internalCode: string;
  productName: string;
  brand: string;
  model: string;
  specs: string;
  purchaseType: string;
  status: string;
  supplier: string;
  costFob: number;
  costLocal: number;
  extraCosts: number;
  landedCost: number;
  estimatedPrice: number;
  priceB2B: number;
  pricePVP: number;
  soldToCustomer: string;
  soldDate: string;
  createdAt: string;
}

export default function TraceabilitySearch() {
  const [searchSerial, setSearchSerial] = useState('');
  const [searching, setSearching] = useState(false);
  const [item, setItem] = useState<InventoryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setItem(null);

    if (!searchSerial.trim()) {
      setError('Ingresa un Serial Number');
      setSearching(false);
      return;
    }

    try {
      const response = await api.get(`/products/inventory/search/${searchSerial}`);
      setItem(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(`No se encontró producto con Serial: ${searchSerial}`);
      } else {
        setError(err.response?.data?.message || 'Error en la búsqueda');
      }
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { bg: string; text: string; emoji: string }> = {
      EN_TRANSITO: { bg: 'bg-yellow-100', text: 'text-yellow-800', emoji: '🔴' },
      DISPONIBLE: { bg: 'bg-green-100', text: 'text-green-800', emoji: '🟢' },
      VENDIDO: { bg: 'bg-blue-100', text: 'text-blue-800', emoji: '✅' },
      DEFECTUOSO: { bg: 'bg-red-100', text: 'text-red-800', emoji: '❌' },
    };
    const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-800', emoji: '❓' };
    return style;
  };

  const getPurchaseTypeBadge = (type: string) => {
    return type === 'INTERNATIONAL'
      ? { bg: 'bg-blue-100', text: 'text-blue-800', emoji: '✈️' }
      : { bg: 'bg-green-100', text: 'text-green-800', emoji: '🏪' };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">🔍 Trazabilidad de Productos</h2>
      <p className="text-gray-600 mb-6">
        Busca cualquier Serial Number para ver el historial completo del producto
      </p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            placeholder="Ingresa Serial Number..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
          >
            {searching ? '⏳ Buscando...' : '🔍 Buscar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {item && (
        <div className="space-y-6">
          {/* Encabezado con Producto e Identificadores */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.productName}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600">Marca</p>
                <p className="font-semibold text-gray-900">{item.brand}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Modelo</p>
                <p className="font-semibold text-gray-900">{item.model}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Serial Number</p>
                <p className="font-mono font-bold text-gray-900">{item.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Código Interno</p>
                <p className="font-mono font-bold text-blue-700">{item.internalCode}</p>
              </div>
            </div>
            {item.specs && (
              <p className="text-sm text-gray-700 mt-3 p-2 bg-white rounded">
                📋 {item.specs}
              </p>
            )}
          </div>

          {/* Estado Actual y Origen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-2">Estado Actual</p>
              {(() => {
                const style = getStatusBadge(item.status);
                return (
                  <span className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${style.bg} ${style.text}`}>
                    {style.emoji} {item.status}
                  </span>
                );
              })()}
            </div>

            <div className="border border-gray-300 rounded-lg p-4">
              <p className="text-gray-600 text-sm mb-2">Tipo de Compra</p>
              {(() => {
                const style = getPurchaseTypeBadge(item.purchaseType);
                return (
                  <span className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${style.bg} ${style.text}`}>
                    {style.emoji} {item.purchaseType === 'INTERNATIONAL' ? 'Compra Internacional' : 'Compra Local'}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Origen y Proveedor */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">📍 Origen y Proveedor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Proveedor</p>
                <p className="font-bold text-gray-900 text-lg">{item.supplier}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Fecha de Ingreso</p>
                <p className="font-bold text-gray-900">
                  {new Date(item.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Detalles de Costos */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">💰 Detalles de Costos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.purchaseType === 'INTERNATIONAL' && (
                <>
                  <div className="bg-white border border-blue-200 rounded p-3">
                    <p className="text-blue-700 text-sm font-semibold">Costo FOB (Compra)</p>
                    <p className="font-bold text-2xl text-blue-600">${item.costFob?.toFixed(2) || 'N/A'}</p>
                  </div>
                  {item.extraCosts && (
                    <div className="bg-white border border-orange-200 rounded p-3">
                      <p className="text-orange-700 text-sm font-semibold">Gastos Extras (Aduana + Flete)</p>
                      <p className="font-bold text-2xl text-orange-600">${item.extraCosts.toFixed(2)}</p>
                    </div>
                  )}
                </>
              )}
              {item.purchaseType === 'LOCAL' && item.costLocal && (
                <div className="bg-white border border-green-200 rounded p-3">
                  <p className="text-green-700 text-sm font-semibold">Costo de Factura</p>
                  <p className="font-bold text-2xl text-green-600">${item.costLocal.toFixed(2)}</p>
                </div>
              )}
              {item.landedCost && (
                <div className="bg-white border-2 border-green-500 rounded p-3">
                  <p className="text-green-700 text-sm font-semibold">✅ Costo Real Final (Landed Cost)</p>
                  <p className="font-bold text-2xl text-green-700">${item.landedCost.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Precios de Venta */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-lg text-gray-900 mb-4">💵 Precios de Venta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {item.estimatedPrice && item.status === 'EN_TRANSITO' && (
                <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                  <p className="text-yellow-700 text-sm font-semibold">Precio Estimado (Web)</p>
                  <p className="font-bold text-2xl text-yellow-700">${item.estimatedPrice.toFixed(2)}</p>
                </div>
              )}
              {item.priceB2B && (
                <div className="bg-white border border-blue-300 rounded p-3">
                  <p className="text-blue-700 text-sm font-semibold">Precio B2B</p>
                  <p className="font-bold text-2xl text-blue-600">${item.priceB2B.toFixed(2)}</p>
                </div>
              )}
              {item.pricePVP && (
                <div className="bg-white border border-green-300 rounded p-3">
                  <p className="text-green-700 text-sm font-semibold">Precio PVP (Público)</p>
                  <p className="font-bold text-2xl text-green-600">${item.pricePVP.toFixed(2)}</p>
                </div>
              )}

              {/* Márgenes de Ganancia */}
              {item.landedCost && item.priceB2B && (
                <div className="bg-purple-50 border border-purple-300 rounded p-3">
                  <p className="text-purple-700 text-sm font-semibold">Margen B2B</p>
                  <p className="font-bold text-2xl text-purple-700">
                    ${(item.priceB2B - item.landedCost).toFixed(2)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    ({((item.priceB2B - item.landedCost) / item.landedCost * 100).toFixed(1)}%)
                  </p>
                </div>
              )}
              {item.landedCost && item.pricePVP && (
                <div className="bg-indigo-50 border border-indigo-300 rounded p-3">
                  <p className="text-indigo-700 text-sm font-semibold">Margen PVP</p>
                  <p className="font-bold text-2xl text-indigo-700">
                    ${(item.pricePVP - item.landedCost).toFixed(2)}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1">
                    ({((item.pricePVP - item.landedCost) / item.landedCost * 100).toFixed(1)}%)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información de Venta (si está vendido) */}
          {item.status === 'VENDIDO' && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <h3 className="font-bold text-lg text-blue-900 mb-3">✅ Información de Venta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-700 text-sm">Cliente</p>
                  <p className="font-bold text-gray-900 text-lg">{item.soldToCustomer}</p>
                </div>
                <div>
                  <p className="text-blue-700 text-sm">Fecha de Venta</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {new Date(item.soldDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Resumen de Estado */}
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">Última actualización:</p>
            <p className="font-semibold text-gray-900">
              {new Date(item.createdAt).toLocaleString('es-ES')}
            </p>
          </div>
        </div>
      )}

      {!item && !error && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded">
          <p className="text-lg">🔍 Ingresa un Serial Number para ver trazabilidad completa</p>
          <p className="text-sm mt-2">Podrás ver: origen, proveedor, costos, precios y cliente final</p>
        </div>
      )}
    </div>
  );
}
