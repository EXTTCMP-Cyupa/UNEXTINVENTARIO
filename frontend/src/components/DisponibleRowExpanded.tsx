'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface DisponibleRowExpandedProps {
  id: number;
  productName: string;
  brand: string;
  model?: string;
  specs: string;
  internalCode: string;
  supplier: string;
  costFob: number;
  costShipping?: number;
  costCustoms?: number;
  serialNumber?: string;
  priceB2B?: number;
  pricePVP?: number;
  productOwner?: string;
  trackingNumber?: string;
  createdAt: string;
  daysInStock: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DisponibleRowExpanded({
  id,
  productName,
  brand,
  model,
  specs,
  internalCode,
  supplier,
  costFob,
  costShipping,
  costCustoms,
  serialNumber = '',
  priceB2B = 0,
  pricePVP = 0,
  productOwner = '',
  trackingNumber = '',
  daysInStock,
  onClose,
  onSuccess,
}: DisponibleRowExpandedProps) {
  // Asegurar que los valores numéricos no sean null/undefined
  const costShippingSafe = costShipping ?? 0;
  const costCustomsSafe = costCustoms ?? 0;
  const costFobSafe = costFob ?? 0;
  const priceB2BSafe = priceB2B ?? 0;
  const pricePVPSafe = pricePVP ?? 0;

  const landedCost = costFobSafe + costShippingSafe + costCustomsSafe;
  const marginB2B = priceB2BSafe - landedCost;
  const marginB2BPercent = landedCost > 0 ? ((marginB2B / landedCost) * 100).toFixed(1) : '0';

  const [form, setForm] = useState({
    customerName: '',
    salePrice: '',
    paymentMethod: 'EFECTIVO',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const salePrice = parseFloat(form.salePrice) || 0;

      if (form.customerName.trim().length === 0) {
        throw new Error('El nombre del cliente es requerido');
      }

      if (salePrice <= 0) {
        throw new Error('El precio de venta debe ser mayor a 0');
      }

      const response = await api.post(`/products/inventory/final-sale/${id}`, {
        inventoryItemId: id,
        customerName: form.customerName.trim(),
        salePrice,
        paymentMethod: form.paymentMethod,
      });

      if (response.status === 200) {
        alert('💰 ¡Venta registrada exitosamente!');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  const margin = parseFloat(form.salePrice) - landedCost || 0;
  const marginPercent = landedCost > 0 && form.salePrice ? ((margin / landedCost) * 100).toFixed(1) : '0';

  return (
    <div className="bg-teal-50 border-t-2 border-teal-200 px-5 py-6 space-y-6">
      {/* Detalles del Producto */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Detalles del Producto</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Nombre</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{productName}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Marca</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{brand}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Modelo</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{model || '—'}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Código Interno</p>
            <p className="text-sm font-mono font-bold text-blue-600 mt-1">{internalCode}</p>
          </div>
        </div>
        {specs && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Especificaciones</p>
            <p className="text-sm text-gray-700 mt-1">{specs}</p>
          </div>
        )}
      </div>

      {/* Costos e Información de Stock (Read-Only) */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">💰 Información Financiera</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Costo Total (Landed Cost)</p>
            <p className="text-lg font-bold text-orange-700 mt-2">${landedCost.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">FOB + Flete + Aduana</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Margen en B2B</p>
            <p className="text-lg font-bold text-blue-700 mt-2">${marginB2B.toFixed(2)} ({marginB2BPercent}%)</p>
            <p className="text-xs text-gray-500 mt-1">Precio B2B: ${priceB2BSafe.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Información de Serie y Dueño */}
      {(serialNumber || productOwner) && (
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">📝 Información de Stock</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serialNumber && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Número de Serie</p>
                <p className="text-sm font-mono font-bold text-gray-900 mt-2">{serialNumber}</p>
              </div>
            )}
            {productOwner && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Dueño</p>
                <p className="text-sm font-bold text-gray-900 mt-2">{productOwner}</p>
              </div>
            )}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Días en Disponible</p>
              <p className="text-sm font-bold text-teal-600 mt-2">{daysInStock} días</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Venta Final */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Datos del Cliente */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">👤 Datos del Cliente</h4>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              placeholder="ej: Juan Pérez, Empresa XYZ"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />
          </div>
        </div>

        {/* Precio de Venta */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">💵 Precio de Venta</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Precio Final de Venta *
              </label>
              <input
                type="number"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                step="0.01"
                min="0"
                placeholder={`ej: ${pricePVPSafe.toFixed(2)}`}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">Precio en el que se vendió el producto</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Método de Pago
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="TARJETA">Tarjeta de Crédito</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>
        </div>

        {/* Margen de Ganancia */}
        {form.salePrice && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-3">📈 Margen Final de Ganancia</p>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Precio de Venta:</span>
                <span className="font-bold">${parseFloat(form.salePrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo Total:</span>
                <span className="font-bold">${landedCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-bold text-green-900">
                <span>Ganancia Neta:</span>
                <span className="text-lg">${margin.toFixed(2)}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                <span>Margen: {marginPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '⏳ Registrando...' : '💰 Completar Venta'}
          </button>
        </div>
      </form>
    </div>
  );
}
