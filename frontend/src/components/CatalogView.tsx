'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/context/CartContext';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        // Fetch available, in transit, and local stock products
        const [availableResponse, transitResponse, stockLocalResponse] = await Promise.all([
          api.get<InventoryItem[]>('/products/inventory/disponible'),
          api.get<InventoryItem[]>('/products/inventory/transito'),
          api.get<InventoryItem[]>('/products/inventory/stock-local'),
        ]);

        const available = availableResponse.data || [];
        const transit = transitResponse.data || [];
        const stockLocal = stockLocalResponse.data || [];
        
        setInventory([...available, ...transit, ...stockLocal].sort((a, b) => 
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

  const handleAddToCart = (item: InventoryItem) => {
    const price = getPrice(item);
    addItem({
      id: item.id,
      productName: item.productName,
      brand: item.brand,
      model: item.model,
      price,
      inventoryItemId: item.id,
      quantity: 1,
    });

    // Mostrar notificación
    setSuccessMessage(`${item.productName} agregado al carrito`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const getPrice = (item: InventoryItem) => {
    if (isAuthenticated && user?.role === 'PARTNER') {
      return item.priceB2B;
    }
    return item.status === 'EN_TRANSITO' ? item.estimatedPrice : item.pricePVP;
  };

  const truncateTitle = (title: string, maxLength: number = 55): string => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Catálogo de Productos
        </h1>
        <p className="text-lg text-gray-600">
          Encuentra las mejores computadoras y accesorios tecnológicos
        </p>
      </div>

      {/* Productos Grid - Compacto y Eficiente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {inventory.map((item) => {
          const isAvailable = item.status === 'DISPONIBLE';
          const price = getPrice(item);
          
          return (
            <div
              key={item.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 flex flex-col h-full overflow-hidden"
            >
              {/* Área de Imagen - Altura Fija */}
              <div className="relative h-[200px] bg-gray-50 overflow-hidden">
                {/* Placeholder para imagen futura con object-fit: contain */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center w-full">
                    <div className="text-5xl mb-2 opacity-30">
                      {isAvailable ? '💻' : item.status === 'STOCK_LOCAL' ? '📤' : '📦'}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.brand} {item.model}
                    </p>
                  </div>
                </div>
                
                {/* Badge de Estado - Flotante Esquina Superior Derecha */}
                <div className="absolute top-2 right-2 z-10">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-green-500 text-white shadow-md uppercase tracking-wide">
                      Disponible
                    </span>
                  ) : item.status === 'STOCK_LOCAL' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-500 text-white shadow-md uppercase tracking-wide">
                      Por Llegar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500 text-white shadow-md uppercase tracking-wide">
                      En Tránsito
                    </span>
                  )}
                </div>

                {/* Hover Effect Sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Marca | Modelo - Subtítulo pequeño */}
                <div className="mb-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {item.brand}{item.model && ` | ${item.model}`}
                  </p>
                </div>

                {/* Título del Producto - Limitado a 55 caracteres */}
                <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
                  {truncateTitle(item.productName)}
                </h3>

                {/* Descripción - Completa sin acortar */}
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {item.specs}
                </p>

                {/* Espaciador flexible para empujar precio y botones al fondo */}
                <div className="flex-grow"></div>

                {/* Precio - Elemento más visible */}
                <div className="mb-3">
                  <p className="text-2xl font-bold text-gray-900">
                    ${price ? price.toFixed(2) : '---'}
                  </p>
                  {!isAvailable && (
                    <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                      Precio estimado*
                    </p>
                  )}
                  {isAuthenticated && user?.role === 'PARTNER' && (
                    <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                      Precio B2B
                    </p>
                  )}
                </div>

                {/* Botones - Alineados horizontalmente */}
                <div className="flex gap-2">
                  {/* Botón Principal - 75% ancho */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-[3] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
                    disabled={!isAvailable}
                  >
                    {isAvailable ? '🛒 Agregar' : 'Próximamente'}
                  </button>
                  
                  {/* Botón Secundario - 25% ancho */}
                  <button className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium py-2 px-2 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400">
                    👁️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notificación de Éxito */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {successMessage}
        </div>
      )}

      {/* Sin productos */}
      {inventory.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
          <div className="text-7xl mb-6">📭</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No hay productos disponibles
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Vuelve pronto. Los productos aparecerán aquí cuando se agreguen al sistema
          </p>
        </div>
      )}
    </div>
  );
}
