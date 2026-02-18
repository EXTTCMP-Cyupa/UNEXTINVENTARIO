'use client';

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

interface PendingOrdersListProps {
  orders: Order[];
  onMarkAsPaid: (order: Order) => void;
  refreshing: boolean;
}

const paymentMethodLabels: { [key: string]: string } = {
  TARJETA: '💳 Tarjeta',
  TRANSFERENCIA: '🏦 Transferencia',
  EFECTIVO: '💵 Efectivo',
};

const deliveryTypeLabels: { [key: string]: string } = {
  CONTRAENTREGA: '📦 Contraentrega',
  PREPAID: '⏳ Prepago',
};

export default function PendingOrdersList({
  orders,
  onMarkAsPaid,
  refreshing,
}: PendingOrdersListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCityColor = (city: string) => {
    return city.toLowerCase() === 'quito'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.orderId}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
        >
          {/* Order Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{order.orderNumber}</h3>
                <p className="text-blue-100 text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ${order.total.toFixed(2)}
                </div>
                <p className="text-blue-100 text-sm">
                  {order.itemCount} {order.itemCount === 1 ? 'producto' : 'productos'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Content */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Datos del Cliente</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium ml-2">{order.customerName}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Cédula:</span>
                    <span className="font-medium ml-2">{order.customerCedula}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium ml-2">{order.customerPhone}</span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Entrega</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getCityColor(order.customerCity)}`}>
                      {order.customerCity}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Dirección:</span>
                    <span className="font-medium ml-2 block mt-1">{order.customerAddress || 'No especificada'}</span>
                  </p>
                  <p className="mt-3">
                    <span className="text-xs font-semibold text-gray-700">
                      {deliveryTypeLabels[order.deliveryType]}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-3">Método de Pago</h4>
                <div className="text-lg font-bold text-amber-700">
                  {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                </div>
                {order.paymentMethod === 'TRANFERENCIA' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Requiere comprobante de transferencia
                  </p>
                )}
                {order.paymentMethod === 'CONTRAENTREGA' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Pago en el momento de la entrega
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Resumen</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between font-bold text-blue-700 pt-2 border-t border-blue-200">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Productos</h4>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.saleId}
                    className="flex justify-between items-start py-2 px-3 bg-white rounded border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-600">
                        {item.brand} {item.model}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onMarkAsPaid(order)}
              disabled={refreshing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {refreshing ? '⏳ Procesando...' : '✅ Confirmar Pago y Marcar Entrega'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
