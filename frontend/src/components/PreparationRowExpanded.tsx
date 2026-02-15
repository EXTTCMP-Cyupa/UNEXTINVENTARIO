'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface PreparationRowExpandedProps {
  id: number;
  productName: string;
  brand: string;
  model?: string;
  specs: string;
  internalCode: string;
  supplier: string;
  costFob: number;
  createdAt: string;
  daysWaiting: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PreparationRowExpanded({
  id,
  productName,
  brand,
  model,
  specs,
  internalCode,
  supplier,
  costFob,
  daysWaiting,
  onClose,
  onSuccess,
}: PreparationRowExpandedProps) {
  const [formData, setFormData] = useState({
    costShipping: 0,
    costCustoms: 0,
    priceReferential: costFob * 1.2,
    priceProvider: costFob,
    priceB2B: 0,              // Precio mayorista - ingresado UNA VEZ aquí
    pricePVP: 0,              // Precio público - ingresado UNA VEZ aquí
    trackingNumber: internalCode, // Sugerencia: usar código interno como tracking
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const landedCost = formData.costShipping + formData.costCustoms + costFob;
  const suggestedMargin = formData.priceReferential - landedCost;

  const handlePrepareShipment = async () => {
    setError(null);
    try {
      if (formData.costShipping < 0 || formData.costCustoms < 0) {
        throw new Error('Los costos no pueden ser negativos');
      }
      if (formData.priceReferential <= 0) {
        throw new Error('Precio referencial debe ser mayor a 0');
      }
      if (!formData.trackingNumber.trim()) {
        throw new Error('Número de tracking es requerido');
      }

      setLoading(true);
      await api.post(`/products/inventory/prepare-shipment/${id}`, {
        costShipping: formData.costShipping,
        costCustoms: formData.costCustoms,
        priceReferential: formData.priceReferential,
        priceProvider: formData.priceProvider,
        priceB2B: formData.priceB2B,      // Enviar precios de venta UNA VEZ
        pricePVP: formData.pricePVP,      // Enviar precios de venta UNA VEZ
      });
      await api.post(`/products/inventory/send-transit/${id}`, {
        trackingNumber: formData.trackingNumber,
        costShippingFinal: formData.costShipping,
        costCustomsFinal: formData.costCustoms,
        notes: formData.notes || null,
      });
      alert('✅ Producto preparado y enviado a tránsito');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al preparar envío');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-t-2 border-yellow-200 px-5 py-6 space-y-6">
      {/* Detalles del Producto */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Detalles del Producto</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Nombre</p>
            <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{productName}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Marca</p>
            <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{brand}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">FOB</p>
            <p className="text-sm font-bold text-blue-600 mt-1">${costFob.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Proveedor</p>
            <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{supplier}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Formulario de Preparación */}
      <div className="space-y-4 p-4 bg-white rounded-lg border border-yellow-200">
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">📋 Ingresa Costos y Precios</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Costo de Flete */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Costo de Flete/Envío Estimado
            </label>
            <input
              type="number"
              value={formData.costShipping}
              onChange={(e) => setFormData({ ...formData, costShipping: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">Costo de transportación internacional</p>
          </div>

          {/* Costo de Aduanas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Costo de Aduanas Estimado
            </label>
            <input
              type="number"
              value={formData.costCustoms}
              onChange={(e) => setFormData({ ...formData, costCustoms: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">Aranceles y gastos aduanales</p>
          </div>

          {/* Precio Referencial de Compra */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Precio Referencial de Compra
            </label>
            <input
              type="number"
              value={formData.priceReferential}
              onChange={(e) => setFormData({ ...formData, priceReferential: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">Precio de compra en eBay o tienda</p>
          </div>

          {/* Precio del Proveedor */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Precio del Proveedor (FOB)
            </label>
            <input
              type="number"
              value={formData.priceProvider}
              onChange={(e) => setFormData({ ...formData, priceProvider: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">Precio base FOB del proveedor</p>
          </div>

          {/* Precio B2B (Mayorista) - INGRESADO UNA VEZ AQUI */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Precio B2B (Mayorista) *
            </label>
            <input
              type="number"
              value={formData.priceB2B}
              onChange={(e) => setFormData({ ...formData, priceB2B: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold"
            />
            <p className="text-xs text-gray-500 mt-1">Precio mayorista - Se usa en todo el flujo</p>
          </div>

          {/* Precio PVP (Público) - INGRESADO UNA VEZ AQUI */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Precio PVP (Público) *
            </label>
            <input
              type="number"
              value={formData.pricePVP}
              onChange={(e) => setFormData({ ...formData, pricePVP: parseFloat(e.target.value) || 0 })}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-semibold"
            />
            <p className="text-xs text-gray-500 mt-1">Precio público/minorista - Se usa en todo el flujo</p>
          </div>

          {/* Tracking */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Número de Tracking *
            </label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              placeholder="Ej: 1Z999AA10123456784"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <p className="text-xs text-gray-500 mt-1">Será usado en el seguimiento de tránsito</p>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Notas de Envío
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones del envío"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>

        {/* Resumen de Costos */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">FOB</p>
            <p className="text-lg font-bold text-blue-600">${costFob.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">+ Flete</p>
            <p className="text-lg font-bold text-orange-600">${formData.costShipping.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">+ Aduanas</p>
            <p className="text-lg font-bold text-red-600">${formData.costCustoms.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold uppercase">= COSTO TOTAL</p>
            <p className="text-lg font-bold text-green-600">${landedCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Margen Sugerido */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-semibold">
            💡 Con precio referencial ${formData.priceReferential.toFixed(2)}, margen sugerido: ${suggestedMargin.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handlePrepareShipment}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
        >
          {loading ? 'Preparando...' : '📋 Preparar y Enviar a Tránsito'}
        </button>
      </div>
    </div>
  );
}
