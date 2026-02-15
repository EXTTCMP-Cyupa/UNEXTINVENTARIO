'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface UpdateLogisticsModalProps {
  id: number;
  productName: string;
  internalCode: string;
  currentStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateLogisticsModal({
  id,
  productName,
  internalCode,
  currentStatus,
  onClose,
  onSuccess,
}: UpdateLogisticsModalProps) {
  const stageLabels: Record<string, string> = {
    'ENVIADO_AL_PAIS': 'Enviado al País',
    'EN_ADUANA': 'En Aduana',
    'EN_CAMINO_AL_LOCAL': 'En Camino al Local',
  };

  const stageOrder = ['ENVIADO_AL_PAIS', 'EN_ADUANA', 'EN_CAMINO_AL_LOCAL'];

  const [selectedStage, setSelectedStage] = useState(currentStatus || 'ENVIADO_AL_PAIS');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('Token no encontrado. Cierra sesión e inicia nuevamente.');
      }
      await api.post(
        `/products/inventory/update-logistics/${id}`,
        {
          logisticsStage: selectedStage,
          notes: notes || `Actualizado a ${stageLabels[selectedStage]}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Sub-estado actualizado a: ${stageLabels[selectedStage]}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.status === 403
        ? 'No autorizado. Inicia sesión como ADMIN e intenta nuevamente.'
        : err.response?.data?.message || err.message || 'Error al actualizar sub-estado';
      setError(errorMsg);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = stageOrder.indexOf(selectedStage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-800">
          <div>
            <h2 className="text-xl font-bold text-white">✈️ Actualizar Sub-Estado de Tránsito</h2>
            <p className="text-blue-100 text-sm mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información del Producto */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Información del Producto</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-900">{productName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Código Interno</p>
                <p className="font-mono font-bold text-blue-600">{internalCode}</p>
              </div>
            </div>
          </div>

          {/* Visual Flujo de Sub-Estados */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-4">📍 Etapas de Tránsito</p>
            <div className="space-y-3">
              {stageOrder.map((stage, index) => (
                <div key={stage}>
                  <button
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedStage === stage
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                            index < currentIndex
                              ? 'bg-green-500'
                              : selectedStage === stage
                              ? 'bg-blue-600'
                              : 'bg-gray-300'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{stageLabels[stage]}</p>
                          <p className="text-xs text-gray-500">
                            {stage === 'ENVIADO_AL_PAIS' && 'Producto enviado desde el país de origen'}
                            {stage === 'EN_ADUANA' && 'Producto en proceso aduanal'}
                            {stage === 'EN_CAMINO_AL_LOCAL' && 'Producto en camino al local de recepción'}
                          </p>
                        </div>
                      </div>
                      {selectedStage === stage && (
                        <div className="text-2xl">✓</div>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notas Opcionales */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas sobre esta actualización de sub-estado..."
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Estado Actual */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Sub-Estado Actual</p>
            <p className="text-lg font-bold text-blue-600">{stageLabels[selectedStage]}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? '⏳ Actualizando...' : '✅ Actualizar Sub-Estado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
