'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface TransitRowExpandedProps {
  id: number;
  productName: string;
  brand: string;
  model?: string;
  specs: string;
  internalCode: string;
  supplier: string;
  status: string;
  costFob: number;
  priceB2B: number;
  pricePVP: number;
  logisticsStage?: string;
  createdAt: string;
  daysInTransit: number;
  onClose: () => void;
  onSuccess: () => void;
}

type ActionType = 'status' | 'confirm_receipt' | 'reserve' | 'send_transit' | null;

interface SaleData {
  customerName: string;
  customerEmail: string;
  reservedPrice: number;
}

interface LocalReceiptData {
  serialNumber: string;
  priceB2B: number;
  pricePVP: number;
}

export default function TransitRowExpanded({
  id,
  productName,
  brand,
  model,
  specs,
  internalCode,
  supplier,
  status,
  costFob,
  priceB2B,
  pricePVP,
  logisticsStage,
  daysInTransit,
  onClose,
  onSuccess,
}: TransitRowExpandedProps) {
  const [action, setAction] = useState<ActionType>(null);
  const [shippingStatus, setShippingStatus] = useState(logisticsStage || 'ENVIADO_AL_PAIS');
  const isInTransit = status === 'EN_TRANSITO';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [localReceiptData, setLocalReceiptData] = useState<LocalReceiptData>({
    serialNumber: '',
    priceB2B: priceB2B || 0,
    pricePVP: pricePVP || 0,
  });
  
  const [saleData, setSaleData] = useState<SaleData>({
    customerName: '',
    customerEmail: '',
    reservedPrice: pricePVP || 0,
  });
  
  const isPreparation = status === 'PREPARACION_ENVIO';
  
  const [sendTransitData, setSendTransitData] = useState({
    trackingNumber: '',
    costShippingFinal: '',
    costCustomsFinal: '',
    notes: '',
  });

  const handleUpdateStatus = async (newStage: string) => {
    setError(null);
    try {
      if (!isInTransit) {
        throw new Error('Solo puedes actualizar sub-estado cuando está EN_TRANSITO');
      }
      setLoading(true);
      setShippingStatus(newStage);
      
      await api.post(
        `/products/inventory/update-logistics/${id}`,
        {
          logisticsStage: newStage,
          notes: `Actualizado a ${newStage}`,
        }
      );
      
      // Si llegó a EN_CAMINO_AL_LOCAL, auto-transiciona a STOCK_LOCAL en el backend
      if (newStage === 'EN_CAMINO_AL_LOCAL') {
        alert('✅ Producto llegó a EN_CAMINO_AL_LOCAL - Auto-transición a STOCK_LOCAL');
        // Esperar 1 segundo antes de cerrar para que el usuario vea el mensaje
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        alert(`✅ Sub-estado actualizado a ${newStage}`);
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.response?.status === 403
        ? 'No autorizado. Inicia sesión como ADMIN e intenta nuevamente.'
        : err.response?.data?.message || 'Error al actualizar sub-estado';
      setError(errorMessage);
      // Restaurar el estado anterior si hay error
      setShippingStatus(logisticsStage || 'ENVIADO_AL_PAIS');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    setError(null);
    try {
      if (!isInTransit) {
        throw new Error('Solo puedes confirmar recepción cuando está EN_TRANSITO');
      }
      if (shippingStatus !== 'EN_CAMINO_AL_LOCAL') {
        throw new Error('Solo puedes confirmar recepción cuando esté EN CAMINO AL LOCAL');
      }
      if (!localReceiptData.serialNumber.trim()) {
        throw new Error('Número de serie es requerido');
      }
      if (localReceiptData.priceB2B <= 0 || localReceiptData.pricePVP <= 0) {
        throw new Error('Los precios deben ser mayores a 0');
      }

      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('Token no encontrado. Cierra sesión e inicia nuevamente.');
      }
      await api.post(
        `/products/inventory/confirm-local-receipt/${id}`,
        {
          serialNumber: localReceiptData.serialNumber,
          priceB2B: localReceiptData.priceB2B,
          pricePVP: localReceiptData.pricePVP,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Recepción local confirmada');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.status === 403
        ? 'No autorizado. Inicia sesión como ADMIN e intenta nuevamente.'
        : err.response?.data?.message || err.message || 'Error al confirmar recepción';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    setError(null);
    try {
      if (!isInTransit) {
        throw new Error('Solo puedes reservar cuando está EN_TRANSITO');
      }
      if (!saleData.customerName.trim()) {
        throw new Error('Nombre del cliente es requerido');
      }

      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('Token no encontrado. Cierra sesión e inicia nuevamente.');
      }
      await api.post(
        `/products/inventory/reserve/${id}`,
        {
          customerName: saleData.customerName,
          customerEmail: saleData.customerEmail,
          reservedPrice: saleData.reservedPrice,
          reservationAmount: saleData.reservedPrice * 0.5,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Producto reservado exitosamente con anticipo del 50%');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.status === 403
        ? 'No autorizado. Inicia sesión como ADMIN e intenta nuevamente.'
        : err.response?.data?.message || err.message || 'Error al reservar';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToTransit = async () => {
    setError(null);
    try {
      if (!isPreparation) {
        throw new Error('Solo puedes enviar a tránsito cuando está en PREPARACION_ENVIO');
      }
      if (!sendTransitData.trackingNumber.trim()) {
        throw new Error('Número de tracking es requerido');
      }
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        throw new Error('Token no encontrado. Cierra sesión e inicia nuevamente.');
      }

      setLoading(true);
      await api.post(
        `/products/inventory/send-transit/${id}`,
        {
          trackingNumber: sendTransitData.trackingNumber,
          costShippingFinal: sendTransitData.costShippingFinal ? parseFloat(sendTransitData.costShippingFinal) : null,
          costCustomsFinal: sendTransitData.costCustomsFinal ? parseFloat(sendTransitData.costCustomsFinal) : null,
          notes: sendTransitData.notes || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Producto enviado a tránsito');
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.status === 403
        ? 'No autorizado. Inicia sesión como ADMIN e intenta nuevamente.'
        : err.response?.data?.message || err.message || 'Error al enviar a tránsito';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stageLabels: Record<string, string> = {
    'ENVIADO_AL_PAIS': 'Enviado al País',
    'EN_ADUANA': 'En Aduana',
    'EN_CAMINO_AL_LOCAL': 'En Camino al Local',
  };

  const stageOrder = ['ENVIADO_AL_PAIS', 'EN_ADUANA', 'EN_CAMINO_AL_LOCAL'];

  return (
    <div className="bg-blue-50 border-t-2 border-blue-200 px-5 py-6 space-y-6">
      {/* Estado Actual del Producto en Tránsito */}
      <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
        <p className="text-xs text-blue-600 font-bold uppercase mb-3">Estado Actual</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">✈️</span>
          <div>
            <p className="text-sm font-bold text-gray-900">En Tránsito Internacional</p>
            <p className="text-xs text-gray-600 mt-1">
              Estado: <span className="font-bold text-blue-600">{stageLabels[shippingStatus]}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Detalles del Producto */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Detalles del Producto</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Nombre</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{productName}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">FOB</p>
            <p className="text-sm font-bold text-blue-600 mt-1">${costFob.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Precio B2B</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">${priceB2B.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 uppercase font-semibold">Precio PVP</p>
            <p className="text-sm font-semibold text-green-600 mt-1">${pricePVP.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Alerta cuando está listo para confirmar recepción */}
      {isInTransit && shippingStatus === 'EN_CAMINO_AL_LOCAL' && action === null && (
        <div className="p-4 bg-green-50 border-2 border-green-400 rounded-lg">
          <p className="text-sm font-bold text-green-800 flex items-center gap-2">
            <span className="text-xl">🎉</span>
            ¡Producto casi listo!
          </p>
          <p className="text-xs text-green-700 mt-2">
            El producto está "En Camino al Local". Cuando lo recibas, confirma la recepción para moverlo a Stock Local.
          </p>
        </div>
      )}

      {/* Acciones - Solo Sub-Estados en EN_TRANSITO */}
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">📍 Cambiar Sub-Estado de Tránsito</h4>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Sub-Estado Actual
            </label>
            <select
              value={shippingStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={loading || !isInTransit}
              className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="ENVIADO_AL_PAIS">📤 Enviado al País</option>
              <option value="EN_ADUANA">🛂 En Aduana</option>
              <option value="EN_CAMINO_AL_LOCAL">🚗 En Camino al Local (Auto-pasa a Stock Local)</option>
            </select>
            <p className="text-xs text-blue-700 mt-2">
              {shippingStatus === 'EN_CAMINO_AL_LOCAL' 
                ? '✅ Cuando confirmes este estado, el producto pasará automáticamente a STOCK_LOCAL'
                : 'Selecciona el nuevo sub-estado y se actualizará automáticamente'}
            </p>
          </div>

          {shippingStatus === 'EN_CAMINO_AL_LOCAL' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800">
                🎉 ¡Productos en camino! 
              </p>
              <p className="text-xs text-green-700 mt-1">
                Este producto está a punto de llegar al local. Cuando confirmes, pasará automáticamente a STOCK_LOCAL donde reverifiarás todos los datos.
              </p>
            </div>
          )}

          {isInTransit ? (
            <p className="text-xs text-blue-700 font-semibold">
              💡 Estado del producto: {isInTransit ? '✈️ EN_TRANSITO' : status}
            </p>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Solo puedes cambiar sub-estados cuando el producto está EN_TRANSITO
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Opción 0: Enviar a Tránsito */}
      {action === 'send_transit' && (
        <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">🚚 Enviar a Tránsito</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Número de Tracking *</label>
                <input
                  type="text"
                  value={sendTransitData.trackingNumber}
                  onChange={(e) => setSendTransitData({ ...sendTransitData, trackingNumber: e.target.value })}
                  placeholder="Ej: 1Z999AA10123456784"
                  className="w-full px-3 py-2.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Costo Flete Final</label>
                  <input
                    type="number"
                    value={sendTransitData.costShippingFinal}
                    onChange={(e) => setSendTransitData({ ...sendTransitData, costShippingFinal: e.target.value })}
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Costo Aduana Final</label>
                  <input
                    type="number"
                    value={sendTransitData.costCustomsFinal}
                    onChange={(e) => setSendTransitData({ ...sendTransitData, costCustomsFinal: e.target.value })}
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Notas</label>
                <textarea
                  value={sendTransitData.notes}
                  onChange={(e) => setSendTransitData({ ...sendTransitData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction(null)}
              className="flex-1 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSendToTransit}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
            >
              {loading ? 'Enviando...' : '✅ Enviar a Tránsito'}
            </button>
          </div>
        </div>
      )}

      {/* Opción 1: Actualizar Sub-Estado de Tránsito */}
      {action === 'status' && (
        <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">📍 Seguimiento de Tránsito</h4>
            
            {/* Indicador Visual del Progreso */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between gap-4">
                {stageOrder.map((stage, index) => (
                  <div key={stage} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mb-2 cursor-pointer transition-all ${
                        stage === shippingStatus
                          ? 'bg-yellow-600 ring-2 ring-yellow-400'
                          : stageOrder.indexOf(stage) < stageOrder.indexOf(shippingStatus)
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                      onClick={() => setShippingStatus(stage)}
                    >
                      {index + 1}
                    </div>
                    <p className="text-xs font-semibold text-center text-gray-700">{stageLabels[stage]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selector */}
            <select
              value={shippingStatus}
              onChange={(e) => setShippingStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="ENVIADO_AL_PAIS">Paso 1: Enviado al País</option>
              <option value="EN_ADUANA">Paso 2: En Aduana</option>
              <option value="EN_CAMINO_AL_LOCAL">Paso 3: En Camino al Local</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction(null)}
              className="flex-1 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus('EN_CAMINO_AL_LOCAL')}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
            >
              {loading ? 'Actualizando...' : '✅ Actualizar Estado'}
            </button>
          </div>
        </div>
      )}

      {/* Opción 2: Confirmar Recepción Local */}
      {action === 'confirm_receipt' && (
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">✅ Confirmar Recepción Local</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Número de Serie/SKU *</label>
                <input
                  type="text"
                  value={localReceiptData.serialNumber}
                  onChange={(e) => setLocalReceiptData({ ...localReceiptData, serialNumber: e.target.value })}
                  placeholder="Número de serie o SKU del producto"
                  className="w-full px-3 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio B2B *</label>
                  <input
                    type="number"
                    value={localReceiptData.priceB2B}
                    onChange={(e) => setLocalReceiptData({ ...localReceiptData, priceB2B: parseFloat(e.target.value) })}
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio PVP *</label>
                  <input
                    type="number"
                    value={localReceiptData.pricePVP}
                    onChange={(e) => setLocalReceiptData({ ...localReceiptData, pricePVP: parseFloat(e.target.value) })}
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction(null)}
              className="flex-1 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmReceipt}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
            >
              {loading ? 'Confirmando...' : '✅ Confirmar Recepción'}
            </button>
          </div>
        </div>
      )}

      {/* Opción 3: Reservar Producto */}
      {action === 'reserve' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">🔒 Información de Reserva</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nombre del Cliente *</label>
                <input
                  type="text"
                  value={saleData.customerName}
                  onChange={(e) => setSaleData({ ...saleData, customerName: e.target.value })}
                  placeholder="Nombre completo del cliente"
                  className="w-full px-3 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email del Cliente</label>
                <input
                  type="email"
                  value={saleData.customerEmail}
                  onChange={(e) => setSaleData({ ...saleData, customerEmail: e.target.value })}
                  placeholder="email@cliente.com"
                  className="w-full px-3 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Precio Reservado</label>
                <input
                  type="number"
                  value={saleData.reservedPrice}
                  onChange={(e) => setSaleData({ ...saleData, reservedPrice: parseFloat(e.target.value) })}
                  step="0.01"
                  className="w-full px-3 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-blue-700 mt-1">💡 Se cobrará 50% de anticipo: ${(saleData.reservedPrice * 0.5).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction(null)}
              className="flex-1 px-4 py-2.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleReserve}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
            >
              {loading ? 'Reservando...' : '🔒 Confirmar Reserva'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
