'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
import PendingOrdersList from '@/components/admin/PendingOrdersList';
import PaymentConfirmModal from '@/components/admin/PaymentConfirmModal';

interface OrderItem {
  saleId: number;
  productName: string;
  brand: string;
  model: string;
  price: number;
}

interface Order {
  orderId: number;
  orderNumber: string;
  createdAt: string;
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/pending');
      setOrders(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes pendientes');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleMarkAsPaid = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (paymentNotes: string) => {
    if (!selectedOrder) return;

    try {
      setRefreshing(true);
      await api.put(`/orders/${selectedOrder.orderId}/mark-paid`, null, {
        params: { paymentNotes },
      });

      // Actualizar la lista removiendo la orden que ya fue pagada
      setOrders(orders.filter((o) => o.orderId !== selectedOrder.orderId));
      setShowPaymentModal(false);
      setSelectedOrder(null);
    } catch (err: any) {
      setError(err.message || 'Error al confirmar pago');
      console.error('Error marking as paid:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Gestionar Órdenes</h1>
              <p className="text-gray-600 mt-2">
                {orders.length} orden{orders.length !== 1 ? 'es' : ''} pendiente{orders.length !== 1 ? 's' : ''} de pago
              </p>
            </div>
            <button
              onClick={fetchPendingOrders}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Excelente!</h3>
            <p className="text-gray-600">No hay órdenes pendientes de pago en este momento.</p>
          </div>
        ) : (
          <PendingOrdersList
            orders={orders}
            onMarkAsPaid={handleMarkAsPaid}
            refreshing={refreshing}
          />
        )}

        {/* Payment confirmation modal */}
        {showPaymentModal && selectedOrder && (
          <PaymentConfirmModal
            order={selectedOrder}
            onConfirm={handleConfirmPayment}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedOrder(null);
            }}
            loading={refreshing}
          />
        )}
      </div>
    </AdminLayout>
  );
}
