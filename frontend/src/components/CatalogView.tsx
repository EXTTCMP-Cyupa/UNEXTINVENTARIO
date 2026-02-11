'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface InventoryItem {
  id: number;
  internalCode: string;
  serialNumber: string;
  status: string;
  productName: string;
  brand: string;
  model: string;
  specs: string;
  priceB2B: number;
  pricePVP: number;
  estimatedPrice: number;
  purchaseType: string;
  createdAt: string;
}

export default function CatalogView() {
  const [mounted, setMounted] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        // Fetch both available and products coming soon
        const [availableResponse, transitResponse] = await Promise.all([
          api.get<InventoryItem[]>('/products/inventory/available'),
          api.get<InventoryItem[]>('/products/inventory/transit'),
        ]);

        const available = availableResponse.data || [];
        const transit = transitResponse.data || [];
        
        setInventory([...available, ...transit].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error cargando catálogo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-2">Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
        {error}
      </div>
    );
  }

  const availableItems = inventory.filter(i => i.status === 'DISPONIBLE');
  const inTransitItems = inventory.filter(i => i.status === 'EN_TRANSITO');

  const getPrice = (item: InventoryItem) => {
    if (isAuthenticated && user?.role === 'PARTNER') {
      return item.priceB2B;
    }
    return item.status === 'EN_TRANSITO' ? item.estimatedPrice : item.pricePVP;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Productos Disponibles */}
      {availableItems.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">🟢 Productos Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border-l-4 border-green-500"
              >
                {/* Imagen placeholder */}
                <div className="bg-gradient-to-br from-green-100 to-green-50 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-4xl">📦</p>
                    <p className="text-gray-600 text-sm mt-2">{item.brand} {item.model}</p>
                  </div>
                </div>

                <div className="p-4">
                  {/* Nombre y Código */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{item.productName}</h3>
                    <p className="text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{item.internalCode}</span>
                    </p>
                  </div>

                  {/* Especificaciones */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.specs}</p>

                  {/* Marca y Modelo */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex gap-2 text-xs">
                      {item.brand && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.brand}</span>}
                      {item.model && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{item.model}</span>}
                    </div>
                  </div>

                  {/* Precios */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-1">
                      {isAuthenticated && user?.role === 'PARTNER' ? 'Precio B2B' : 'Precio PVP'}
                    </p>
                    <p className="font-bold text-2xl text-green-700">${getPrice(item).toFixed(2)}</p>
                  </div>

                  {/* Serial Number */}
                  {item.serialNumber && (
                    <p className="text-xs text-gray-500 text-center mb-4 font-mono bg-gray-50 p-2 rounded">
                      📱 {item.serialNumber}
                    </p>
                  )}

                  {/* Botón */}
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition">
                    🛒 Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos en Tránsito */}
      {inTransitItems.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900">✈️ Llega Pronto</h2>
          <p className="text-gray-600 mb-6">Estos productos están en tránsito internacional y llegarán pronto</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inTransitItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden border-l-4 border-yellow-500 opacity-90"
              >
                {/* Imagen placeholder */}
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 h-48 flex items-center justify-center relative">
                  <div className="text-center">
                    <p className="text-4xl">⏳</p>
                    <p className="text-gray-600 text-sm mt-2">En Tránsito</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    EN TRÁNSITO
                  </div>
                </div>

                <div className="p-4">
                  {/* Nombre y Código */}
                  <div className="mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{item.productName}</h3>
                    <p className="text-xs text-gray-500">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{item.internalCode}</span>
                    </p>
                  </div>

                  {/* Especificaciones */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.specs}</p>

                  {/* Marca y Modelo */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex gap-2 text-xs">
                      {item.brand && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{item.brand}</span>}
                      {item.model && <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{item.model}</span>}
                    </div>
                  </div>

                  {/* Precio Estimado */}
                  <div className="bg-yellow-50 rounded p-3 mb-4">
                    <p className="text-xs text-yellow-600 font-semibold">Precio Estimado</p>
                    <p className="font-bold text-yellow-700 text-2xl">${item.estimatedPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">*(Sujeto a cambios)</p>
                  </div>

                  {/* Proveedor */}
                  <p className="text-xs text-gray-600 text-center mb-4 bg-gray-50 p-2 rounded">
                    📦 Origen: Internacional
                  </p>

                  {/* Botón deshabilitado */}
                  <button
                    disabled
                    className="w-full bg-gray-400 text-white font-semibold py-2 rounded cursor-not-allowed opacity-60"
                  >
                    ⏳ Disponible Pronto
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin productos */}
      {availableItems.length === 0 && inTransitItems.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-600 text-lg font-semibold">No hay productos disponibles</p>
          <p className="text-gray-500 text-sm mt-2">
            Vuelve pronto. Los productos aparecerán aquí cuando se agreguen al sistema
          </p>
        </div>
      )}
    </div>
  );
}
