'use client';

import { useState } from 'react';
import { api } from '@/services/api';

interface OrderItem {
  saleId?: number;
  productName: string;
  brand: string;
  model: string;
  price?: number;
  quantity?: number;
  unitPrice?: number;
}

interface Order {
  orderId: number;
  orderNumber: string;
  createdAt?: string;
  customerName: string;
  customerCedula: string;
  customerCity: string;
  customerPhone: string;
  customerAddress?: string;
  orderStatus: string;
  paymentMethod: string;
  deliveryType: string;
  subtotal: number;
  total: number;
  itemCount: number;
  items: OrderItem[];
  isPaid: boolean;
  paymentNotes?: string;
}

interface PaymentConfirmModalProps {
  order: Order;
  onConfirm?: (paymentNotes: string) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  onConfirmed?: () => void;
}

export default function PaymentConfirmModal({
  order,
  onConfirm,
  onClose,
  loading,
  onConfirmed,
}: PaymentConfirmModalProps) {
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onConfirm) {
        await onConfirm(paymentNotes);
      } else {
        await api.put(
          `/orders/${order.orderId}/mark-paid?paymentNotes=${encodeURIComponent(paymentNotes)}`
        );
        if (onConfirmed) {
          onConfirmed();
        }
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error al confirmar pago. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethodLabels: { [key: string]: string } = {
    TARJETA: '💳 Tarjeta',
    TRANSFERENCIA: '🏦 Transferencia',
    EFECTIVO: '💵 Efectivo',
  };

  const deliveryTypeLabels: { [key: string]: string } = {
    CONTRAENTREGA: '📦 Contraentrega',
    PREPAID: '⏳ Prepago',
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Confirmar Pago</h2>
            <p className="text-green-100 text-sm mt-1">Orden: {order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading || isSubmitting}
            className="text-2xl hover:opacity-80 transition disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Order Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-bold text-lg text-gray-900">{order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="font-bold text-2xl text-green-600">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Método de Pago</h4>
              <p className="text-lg font-bold text-gray-900">
                {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tipo de Entrega</h4>
              <p className="text-lg font-bold text-gray-900">
                {deliveryTypeLabels[order.deliveryType]}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📍 Dirección de Entrega</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-700">Ciudad:</span>
                <span className="font-medium ml-2">{order.customerCity}</span>
              </p>
              <p>
                <span className="text-gray-700">Dirección:</span>
                <span className="font-medium ml-2 block">
                  {order.customerAddress || 'No especificada'}
                </span>
              </p>
              <p>
                <span className="text-gray-700">Teléfono:</span>
                <span className="font-medium ml-2">{order.customerPhone}</span>
              </p>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Productos a Entregar</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {order.items.map((item, index) => (
                <div
                  key={item.saleId || index}
                  className="flex justify-between items-start py-2 px-3 bg-white rounded border border-gray-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-600">
                      {item.brand} {item.model}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price || item.unitPrice || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Notes Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notas de Pago (Opcional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Ej: Comprobante de transferencia #12345, Referencia de pago, etc."
                maxLength={500}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {paymentNotes.length}/500 caracteres
              </p>
            </div>

            {/* Confirmation Warning */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Verificacion:</span> Al confirmar, esta
                orden pasara de estado PRE_VENDIDA a VENDIDA y el inventario se actualizara.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
