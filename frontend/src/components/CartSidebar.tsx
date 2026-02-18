'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

export default function CartSidebar() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        title="Carrito de compras"
      >
        <div className="relative">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Sidebar del Carrito */}
      <div className="fixed right-0 top-0 w-full max-w-md h-screen bg-white shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">🛒 Carrito</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-2xl hover:opacity-80 transition"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Carrito vacío</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-600 hover:underline font-semibold"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.inventoryItemId}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {item.brand} {item.model}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-lg text-blue-600">
                    ${item.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.inventoryItemId)}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold"
                  >
                    Eliminar
                  </button>
                </div>

                {/* Cantidad */}
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => updateQuantity(item.inventoryItemId, (item.quantity || 1) - 1)}
                    className="px-2 py-1 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 font-semibold min-w-[40px] text-center">
                    {item.quantity || 1}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.inventoryItemId, (item.quantity || 1) + 1)}
                    className="px-2 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900">
                <span>Total:</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
            >
              Proceder a Comprar
            </button>

            <button
              onClick={clearCart}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200"
            >
              Vaciar Carrito
            </button>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            setIsOpen(false);
          }}
          items={items}
          total={total}
        />
      )}
    </>
  );
}
