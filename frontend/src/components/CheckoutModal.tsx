'use client';

import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  productName: string;
  brand: string;
  model: string;
  price: number;
  inventoryItemId: number;
  quantity: number;
}

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  items: CartItem[];
  total: number;
}

export default function CheckoutModal({ onClose, onSuccess, items, total }: CheckoutModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuito, setIsQuito] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCedula: '',
    customerCity: 'Quito',
    customerAddress: '',
    paymentMethod: 'EFECTIVO',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'customerCity') {
      setIsQuito(value === 'Quito');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!formData.customerName) throw new Error('Nombre es requerido');
      if (!formData.customerPhone) throw new Error('Teléfono es requerido');
      if (!formData.customerCedula) throw new Error('Cédula es requerida');
      if (!formData.customerCity) throw new Error('Ciudad es requerida');
      if (!formData.customerAddress) throw new Error('Dirección es requerida');

      // Preparar los items del carrito
      const cartItems = items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity || 1,
        unitPrice: item.price,
      }));

      // Crear la orden
      const checkoutData = {
        ...formData,
        items: cartItems,
        deliveryType: isQuito ? 'CONTRAENTREGA' : 'PREPAID',
      };

      const response = await api.post('/orders/checkout', checkoutData);

      onClose();
      if (onSuccess) {
        onSuccess();
      }

      // Redirigir a página de confirmación
      router.push(`/order-confirmation/${response.data.orderId}`);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">Confirmar Compra</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Resumen de items */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-lg mb-3">Resumen de Compra</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {items.map((item) => (
                <div key={item.inventoryItemId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.productName} x{item.quantity || 1}
                  </span>
                  <span className="font-semibold">
                    ${((item.price * (item.quantity || 1)) / (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Cédula *
                </label>
                <input
                  type="text"
                  name="customerCedula"
                  value={formData.customerCedula}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: 0999999999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: correo@ejemplo.com"
                />
              </div>
            </div>

            {/* Datos de Entrega */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-lg mb-4">Datos de Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <select
                    name="customerCity"
                    value={formData.customerCity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="Quito">Quito (Contraentrega)</option>
                    <option value="Guayaquil">Guayaquil (Prepago)</option>
                    <option value="Cuenca">Cuenca (Prepago)</option>
                    <option value="Otra">Otra Ciudad (Prepago)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Método de Pago *
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                    <option value="TARJETA">Tarjeta de Crédito</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dirección Completa *
                </label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Calle, número, apto, sector, referencia..."
                  rows={3}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Ej: Tocar timbre 3 veces, entregar en horario laboral..."
                  rows={2}
                />
              </div>
            </div>

            {/* Info de Entrega */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-bold">Tipo de Entrega:</span>{' '}
                {isQuito ? 'Contraentrega en Quito' : 'Prepago - Envío a domicilio'}
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-lg transition-all"
              >
                {loading ? 'Procesando...' : 'Confirmar Compra'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
