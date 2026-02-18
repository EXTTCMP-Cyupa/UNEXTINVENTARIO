'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import Link from 'next/link';

interface OrderData {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerCity: string;
  total: number;
  orderStatus: string;
  paymentMethod: string;
  deliveryType: string;
  isPaid: boolean;
  items: Array<{
    productName: string;
    brand: string;
    price: number;
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        setError('No se pudo cargar la orden');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando información de orden...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'No se encontró la orden'}</p>
          <Link
            href="/catalog"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = order.isPaid ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300';
  const statusText = order.isPaid ? 'Pagada' : 'Pendiente de Pago';
  const statusIcon = order.isPaid ? '✓' : '⏳';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header de Éxito */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Compra Registrada!
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Tu orden ha sido creada exitosamente. Aquí están los detalles:
          </p>

          {/* Número de Orden */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 inline-block mb-6">
            <p className="text-sm text-gray-600 mb-1">Número de Orden</p>
            <p className="text-3xl font-bold text-blue-600 font-mono">
              {order.orderNumber}
            </p>
          </div>
        </div>

        {/* Información de la Orden */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de la Orden</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Datos del Cliente */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3">Datos del Cliente</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Nombre</p>
                  <p className="font-semibold text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ciudad</p>
                  <p className="font-semibold text-gray-900">{order.customerCity}</p>
                </div>
              </div>
            </div>

            {/* Información de Pago */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3">Métodos</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Pago</p>
                  <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600">Entrega</p>
                  <p className="font-semibold text-gray-900">
                    {order.deliveryType === 'CONTRAENTREGA' ? 'Contraentrega' : 'Prepago'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado del Pago */}
          <div className={`border-2 rounded-lg p-4 ${statusColor}`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{statusIcon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-700">Estado de Pago</p>
                <p className="text-lg font-bold">{statusText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Comprados */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos en la Orden</h2>

          <div className="space-y-3 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">{item.brand}</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-3xl font-bold text-blue-600">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos Pasos */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximos Pasos</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Confirmación</p>
                <p className="text-gray-600 text-sm">
                  Recibirás un email con los detalles de tu orden
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Verificación de Pago</p>
                <p className="text-gray-600 text-sm">
                  {order.deliveryType === 'CONTRAENTREGA'
                    ? 'Nuestro equipo verificará tu compra para Contraentrega'
                    : 'Realiza la transferencia y envía el comprobante'}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Entrega</p>
                <p className="text-gray-600 text-sm">
                  Tu producto será {order.deliveryType === 'CONTRAENTREGA' ? 'entregado en Quito' : 'enviado a tu domicilio'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/catalog"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition text-center"
          >
            Continuar Comprando
          </Link>
          <Link
            href="/"
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition text-center"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
