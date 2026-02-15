'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface QuickActionButtonsProps {
  item: {
    id: number;
    status: string;
    productName?: string;
    internalCode: string;
  };
  onActionComplete: () => void;
}

export default function QuickActionButtons({ item, onActionComplete }: QuickActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoveToTransit = async () => {
    if (!confirm('¿Mover a EN_TRANSITO? Se registrará el envío del proveedor')) return;
    
    try {
      setLoading(true);
      setError(null);
      await api.post(`/products/inventory/move-to-transit/${item.id}`);
      alert('✓ Producto movido a EN_TRANSITO');
      onActionComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al mover producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailableForSale = async () => {
    if (!confirm('¿Activar para venta? El producto será visible en catálogo')) return;
    
    try {
      setLoading(true);
      setError(null);
      await api.post(`/products/inventory/activate-sale/${item.id}`);
      alert('✓ Producto está disponible para venta');
      onActionComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al activar producto');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar botones según estado
  if (item.status === 'COMPRADO') {
    return (
      <button
        onClick={handleMoveToTransit}
        disabled={loading}
        className="px-3 py-1.5 text-xs font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
        title="Confirmar que el envío salió del proveedor"
      >
        {loading ? 'Moviendo...' : '✈️ Envío Confirmado'}
      </button>
    );
  }

  if (error) {
    return <div className="text-xs text-red-600">{error}</div>;
  }

  return null;
}
