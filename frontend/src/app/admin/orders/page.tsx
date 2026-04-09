'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBanner from '@/components/admin/AdminStatusBanner';
import PendingOrdersList from '@/components/admin/PendingOrdersList';
import PaymentConfirmModal from '@/components/admin/PaymentConfirmModal';
import { useAuthStore } from '@/store/authStore';

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
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (mounted && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/pending');
      setOrders(response.data || []);
      setError(null);
      setLastUpdated(new Date().toLocaleString());
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes pendientes');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && user?.role === 'ADMIN') {
      fetchPendingOrders();
    }
  }, [mounted, user]);

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-yellow-800">
                <p>Acceso denegado. Solo administradores pueden acceder a esta página.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-6 space-y-6 lg:p-8">
        <AdminPageHeader
          title="Gestionar Ordenes"
          description={`${orders.length} orden${orders.length !== 1 ? 'es' : ''} pendiente${orders.length !== 1 ? 's' : ''} de pago`}
          lastUpdated={lastUpdated}
          onRefresh={fetchPendingOrders}
          refreshing={loading}
          refreshLabel="Actualizar"
        />

        {error && (
          <AdminStatusBanner
            variant="error"
            title="No pudimos cargar las ordenes"
            message={error}
            actionLabel="Reintentar"
            onAction={fetchPendingOrders}
          />
        )}

        {/* Orders list */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-3 text-sm text-gray-600" aria-live="polite">Cargando ordenes pendientes...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
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
    </DashboardLayout>
  );
}
