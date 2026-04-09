'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface StockLocalRowExpandedProps {
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
  priceB2B?: number;
  pricePVP?: number;
  productOwner?: string;
  trackingNumber?: string;
  createdAt: string;
  daysInTransit: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StockLocalRowExpanded({
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
  priceB2B = 0,
  pricePVP = 0,
  productOwner = '',
  trackingNumber = '',
  daysInTransit,
  onClose,
  onSuccess,
}: StockLocalRowExpandedProps) {
  // Asegurar que los valores numéricos no sean null/undefined
  const costShippingSafe = costShipping ?? 0;
  const costCustomsSafe = costCustoms ?? 0;
  const costFobSafe = costFob ?? 0;
  const priceB2BSafe = priceB2B ?? 0;
  const pricePVPSafe = pricePVP ?? 0;
  
  const [form, setForm] = useState({
    productOwner: productOwner || '',
    // NO se editan precios aquí - ya fueron ingresados en PREPARACION
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const landedCost = costFobSafe + costShippingSafe + costCustomsSafe;

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const imageFiles = files.filter((file) => file.type.startsWith('image/')).slice(0, 4);
      if (imageFiles.length === 0) {
        setError('Selecciona archivos de imagen validos (jpg, png, webp)');
        return;
      }

      const oversized = imageFiles.find((file) => file.size > 2 * 1024 * 1024);
      if (oversized) {
        setError('Cada imagen debe ser menor a 2MB');
        return;
      }

      const dataUrls = await Promise.all(imageFiles.map(fileToDataUrl));
      setPhotoPreviews(dataUrls);
    } catch (err: any) {
      setError(err.message || 'Error al procesar imagenes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (form.productOwner.trim().length === 0) {
        throw new Error('El nombre del dueño/inversor es requerido');
      }

      const response = await api.post(`/products/inventory/confirm-local-receipt/${id}`, {
        inventoryItemId: id,
        productOwner: form.productOwner,
        imageUrls: photoPreviews,
        // Los precios ya fueron ingresados en PREPARACION - NO se envían aquí
      });

      if (response.status === 200) {
        alert('✅ Recepción confirmada - Producto en STOCK_LOCAL');
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al confirmar recepción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-purple-50 border-t-2 border-purple-200 px-5 py-6 space-y-6">
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

      {/* Costos de Importación Ya Ingresados (Read-Only) */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">📦 Costos de Importación (Ya Ingresados)</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Costo FOB</p>
            <p className="text-lg font-bold text-blue-700 mt-2">${costFobSafe.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">De: {supplier}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Costo Flete</p>
            <p className="text-lg font-bold text-green-700 mt-2">${costShippingSafe.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">De: PREPARACION</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Costo Aduana</p>
            <p className="text-lg font-bold text-orange-700 mt-2">${costCustomsSafe.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">De: TRANSITO</p>
          </div>
        </div>
      </div>

      {/* Cálculo de Costo Total (Landed Cost) */}
      <div className="p-4 bg-white border-2 border-purple-300 rounded-lg">
        <p className="text-sm font-semibold text-purple-900 mb-3">🧮 Costo Total Calculado (Landed Cost)</p>
        <div className="space-y-2 text-sm text-purple-800 font-mono">
          <div className="flex justify-between">
            <span>FOB:</span>
            <span className="font-bold">${costFobSafe.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Flete:</span>
            <span className="font-bold">${costShippingSafe.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>+ Aduana:</span>
            <span className="font-bold">${costCustomsSafe.toFixed(2)}</span>
          </div>
          <div className="border-t border-purple-300 pt-2 mt-2 flex justify-between font-bold text-lg text-purple-900">
            <span>= Costo Total:</span>
            <span className="text-purple-600">${landedCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Información de Envío (Read-Only) */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">✈️ Información de Envío</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Número de Seguimiento</p>
            <p className="text-sm font-mono font-bold text-gray-900 mt-2">{trackingNumber || 'Sin asignar'}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">Días en Tránsito</p>
            <p className="text-sm font-bold text-orange-600 mt-2">{daysInTransit} días</p>
          </div>
        </div>
      </div>

      {/* Formulario de Confirmación de Recepción */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Dueño del Producto */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">👤 Dueño del Producto</h4>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Inversor / Dueño *
            </label>
            <input
              type="text"
              value={form.productOwner}
              onChange={(e) => setForm({ ...form, productOwner: e.target.value })}
              placeholder="ej: Juan Pérez, Empresa XYZ"
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
            <p className="text-xs text-gray-500 mt-1">Se usa para identificar a quién pagar cuando se venda el producto</p>
          </div>
        </div>

        {/* Fotos del Equipo */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">📸 Fotos del Equipo en Local</h4>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-purple-700 file:font-semibold hover:file:bg-purple-200"
            />
            <p className="text-xs text-gray-500">Puedes cargar hasta 4 fotos (max 2MB c/u). La primera foto se mostrara en catalogo.</p>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {photoPreviews.map((url, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img src={url} alt={`Preview ${index + 1}`} className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 rounded-full bg-black/70 text-white text-xs px-2 py-0.5"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


        {/* Precios de Venta (Ya ingresados en PREPARACION - Read Only) */}
        <div>
          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">💵 Precios de Venta (Ingresados en Preparación)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio B2B (Mayorista)</p>
              <p className="text-lg font-bold text-green-700 mt-2">${priceB2BSafe.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Ingresado en PREPARACION - No se edita aquí</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio PVP (Público)</p>
              <p className="text-lg font-bold text-blue-700 mt-2">${pricePVPSafe.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Ingresado en PREPARACION - No se edita aquí</p>
            </div>
          </div>
        </div>

        {/* Margen Sugerido */}
        {priceB2BSafe > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-3">📈 Margen Estimado</p>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Precio B2B:</span>
                <span className="font-bold">${priceB2BSafe.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo Total:</span>
                <span className="font-bold">${landedCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-green-300 pt-2 mt-2 flex justify-between font-bold text-green-900">
                <span>Margen:</span>
                <span>${(priceB2BSafe - landedCost).toFixed(2)}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {landedCost > 0 && (
                  <span>
                    Margen: {(((priceB2BSafe - landedCost) / landedCost) * 100).toFixed(1)}%
                  </span>
                )}
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
            className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '⏳ Procesando...' : '✅ Confirmar Recepción'}
          </button>
        </div>
      </form>
    </div>
  );
}
