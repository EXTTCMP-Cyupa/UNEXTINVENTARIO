'use client';

import Header from '@/components/Header';
import { useState } from 'react';
import { warrantyService } from '@/services/api';
import { WarrantyHistory } from '@/types';

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
      setError('No se encontró información de garantía para este número de serie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Consulta de Garantía</h1>

        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ingrese número de serie"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="flex-1 border rounded px-4 py-2"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-secondary text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        {warranty && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold text-primary mb-6">Historial de Garantía</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Número de Serie</p>
                <p className="font-semibold">{warranty.serialNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Código Interno</p>
                <p className="font-semibold">{warranty.internalCode}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Producto</p>
                <p className="font-semibold">{warranty.productName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">SKU</p>
                <p className="font-semibold">{warranty.productSku}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Proveedor</p>
                <p className="font-semibold">{warranty.importProvider}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Fecha de Importación</p>
                <p className="font-semibold">
                  {new Date(warranty.importDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Estado</p>
                <p className={`font-semibold ${
                  warranty.status === 'AVAILABLE' ? 'text-green-600' :
                  warranty.status === 'SOLD' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {warranty.status}
                </p>
              </div>

              {warranty.saleDate && (
                <div>
                  <p className="text-gray-600 text-sm">Fecha de Venta</p>
                  <p className="font-semibold">
                    {new Date(warranty.saleDate).toLocaleDateString()}
                  </p>
                </div>
              )}

              {warranty.customerName && (
                <div>
                  <p className="text-gray-600 text-sm">Cliente</p>
                  <p className="font-semibold">{warranty.customerName}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-gray-600 text-sm">Precio Unitario (Costo Real)</p>
              <p className="text-3xl font-bold text-secondary">${warranty.unitPrice.toFixed(2)}</p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
