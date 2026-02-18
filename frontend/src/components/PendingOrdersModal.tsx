'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { usePendingOrdersModal } from '@/context/PendingOrdersContext';
import PaymentConfirmModal from './admin/PaymentConfirmModal';

interface Order {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerCedula: string;
  customerCity: string;
  customerPhone: string;
  customerAddress: string;
  orderStatus: string;
  paymentMethod: string;
  deliveryType: string;
  subtotal: number;
  total: number;
  itemCount: number;
  items: Array<{
    productName: string;
    brand: string;
    model: string;
    quantity: number;
    unitPrice: number;
  }>;
  isPaid: boolean;
  paymentNotes: string | null;
}

export default function PendingOrdersModal() {
  const { isOpen, closeModal } = usePendingOrdersModal();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPendingOrders();
    }
  }, [isOpen]);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/pending');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
    setLoading(false);
  };

  const handleConfirmPayment = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirmed = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    fetchPendingOrders();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">📦 Órdenes Pendientes</h2>
              <p className="text-blue-100 text-sm mt-1">Gestión de órdenes PRE_VENDIDA</p>
            </div>
            <button
              onClick={closeModal}
              className="text-white hover:bg-blue-800 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Cargando órdenes...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">✓ No hay órdenes pendientes</p>
                <p className="text-gray-400 mt-2">Todas las órdenes han sido procesadas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date().toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">${order.total.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-b border-gray-200 py-3 mb-3">
                      <p className="text-sm font-medium text-gray-700">👤 {order.customerName}</p>
                      <p className="text-xs text-gray-600">
                        Cédula: {order.customerCedula}
                      </p>
                      <p className="text-xs text-gray-600">
                        Teléfono: {order.customerPhone}
                      </p>
                    </div>

                    {/* Delivery Info */}
                    <div className="mb-3 text-sm">
                      <p className="text-gray-700">
                        📍 Entrega: <span className="font-semibold">{order.deliveryType}</span>
                      </p>
                      <p className="text-gray-700">
                        💳 Pago: <span className="font-semibold">{order.paymentMethod}</span>
                      </p>
                      <p className="text-gray-600 text-xs mt-2">
                        {order.customerAddress} - {order.customerCity}
                      </p>
                    </div>

                    {/* Items Count */}
                    <p className="text-xs text-gray-500 mb-3">
                      {order.items.length} artículo(s) • ${order.subtotal.toFixed(2)}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={() => handleConfirmPayment(order)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      Confirmar Pago
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
            <button
              onClick={closeModal}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Payment Confirm Modal */}
      {showPaymentModal && selectedOrder && (
        <PaymentConfirmModal
          order={selectedOrder}
          onClose={() => setShowPaymentModal(false)}
          onConfirmed={handlePaymentConfirmed}
        />
      )}
    </>
  );
}
