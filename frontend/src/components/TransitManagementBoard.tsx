'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface InventoryItem {
  id: number;
  productName: string;
  brand: string;
  specs: string;
  internalCode: string;
  supplier: string;
  costFob: number;
  estimatedPrice: number;
  createdAt: string;
}

interface LiquidationForm {
  inventoryItemId: number;
  aduanaCost: string;
  fleteCourrierCost: string;
  serialNumber: string;
  priceB2B: string;
  pricePVP: string;
}

export default function TransitManagementBoard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [liquidationForm, setLiquidationForm] = useState<LiquidationForm>({
    inventoryItemId: 0,
    aduanaCost: '',
    fleteCourrierCost: '',
    serialNumber: '',
    priceB2B: '',
    pricePVP: '',
  });
  const [liquidating, setLiquidating] = useState(false);
  const [success, setSuccess] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && token) {
      fetchTransitItems();
    }
  }, [mounted, token]);

  const fetchTransitItems = async () => {
    try {
      const response = await api.get('/products/inventory/transit');
      setItems(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar productos en tránsito');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInTransit = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleRecibir = (item: InventoryItem) => {
    setExpandedId(item.id);
    setLiquidationForm({
      inventoryItemId: item.id,
      aduanaCost: '',
      fleteCourrierCost: '',
      serialNumber: '',
      priceB2B: item.estimatedPrice.toString(),
      pricePVP: (item.estimatedPrice * 1.3).toFixed(2),
    });
  };

  const handleLiquidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      if (!liquidationForm.serialNumber.trim()) {
        throw new Error('Escanea o ingresa el Serial Number');
      }
      if (!liquidationForm.aduanaCost || parseFloat(liquidationForm.aduanaCost) < 0) {
        throw new Error('Ingresa costo de aduana válido');
      }

      const aduanaCost = parseFloat(liquidationForm.aduanaCost);
      const fleteCourrierCost = liquidationForm.fleteCourrierCost 
        ? parseFloat(liquidationForm.fleteCourrierCost) 
        : 0;
      const priceB2B = parseFloat(liquidationForm.priceB2B);
      const pricePVP = parseFloat(liquidationForm.pricePVP);

      // Validaciones
      const item = items.find(i => i.id === liquidationForm.inventoryItemId);
      if (!item) throw new Error('Producto no encontrado');

      const totalCosts = aduanaCost + fleteCourrierCost;
      const landedCost = item.costFob + totalCosts;

      if (priceB2B <= landedCost) {
        throw new Error(`Precio B2B debe ser mayor a costo real ($${landedCost.toFixed(2)})`);
      }
      if (pricePVP <= priceB2B) {
        throw new Error('Precio PVP debe ser mayor a precio B2B');
      }

      setLiquidating(true);

      await api.post('/products/inventory/liquidate', {
        inventoryItemId: liquidationForm.inventoryItemId,
        aduanaCost: parseFloat(liquidationForm.aduanaCost),
        fleteCourrierCost: fleteCourrierCost || undefined,
        serialNumber: liquidationForm.serialNumber,
        priceB2B,
        pricePVP,
      });

      setSuccess(true);
      setTimeout(() => {
        fetchTransitItems();
        setExpandedId(null);
        setLiquidationForm({
          inventoryItemId: 0,
          aduanaCost: '',
          fleteCourrierCost: '',
          serialNumber: '',
          priceB2B: '',
          pricePVP: '',
        });
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al liquidar');
    } finally {
      setLiquidating(false);
    }
  };

  if (!mounted) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  if (loading) {
    return <div className="text-center py-10">Cargando productos en tránsito...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">
        📦 Tablero de Administración de Tránsito
      </h2>
      <p className="text-gray-600 mb-6">
        Productos en EN_TRÁNSITO esperando ser recibidos y liquidados
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ Mercadería recibida y liquidada exitosamente
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded">
          <p className="text-lg">📭 No hay productos en tránsito</p>
          <p className="text-sm mt-2">Todos los productos han llegado e sido liquidados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-yellow-300 bg-yellow-50 rounded-lg p-4 hover:shadow-md transition"
            >
              {/* Tarjeta Principal */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{item.productName}</h3>
                  <p className="text-sm text-gray-600">
                    {item.brand} {item.model}
                  </p>
                  {item.specs && (
                    <p className="text-xs text-gray-600 mt-1">
                      📋 Specs: {item.specs}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                    🔴 EN TRÁNSITO
                  </span>
                  <p className="text-xs text-gray-600 mt-2">
                    Comprada hace {getDaysInTransit(item.createdAt)} {getDaysInTransit(item.createdAt) === 1 ? 'día' : 'días'}
                  </p>
                </div>
              </div>

              {/* Información Básica */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-white rounded">
                <div>
                  <p className="text-xs text-gray-600">Código</p>
                  <p className="font-mono font-semibold text-gray-900">{item.internalCode}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Proveedor</p>
                  <p className="font-semibold text-gray-900">{item.supplier}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Costo FOB</p>
                  <p className="font-bold text-blue-600">${item.costFob.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Precio Est.</p>
                  <p className="font-bold text-green-600">${item.estimatedPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Formulario de Liquidación */}
              {expandedId === item.id && (
                <form onSubmit={handleLiquidate} className="border-t pt-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-4">🎯 Recibir Mercadería</h4>

                  {/* Gastos de Importación */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">💰 Gastos de Importación</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Costo Aduana *
                        </label>
                        <input
                          type="number"
                          value={liquidationForm.aduanaCost}
                          onChange={(e) =>
                            setLiquidationForm({
                              ...liquidationForm,
                              aduanaCost: e.target.value,
                            })
                          }
                          step="0.01"
                          min="0"
                          placeholder="ej: 40.00"
                          required
                          className="w-full px-2 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Costo Flete Courier
                        </label>
                        <input
                          type="number"
                          value={liquidationForm.fleteCourrierCost}
                          onChange={(e) =>
                            setLiquidationForm({
                              ...liquidationForm,
                              fleteCourrierCost: e.target.value,
                            })
                          }
                          step="0.01"
                          min="0"
                          placeholder="ej: 15.00 (DHL/FedEx)"
                          className="w-full px-2 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cálculo de Costo Real */}
                  {(liquidationForm.aduanaCost || liquidationForm.fleteCourrierCost) && (
                    <div className="mb-4 p-3 bg-green-100 rounded border border-green-300">
                      <p className="text-xs text-green-700 font-semibold mb-2">🧮 Cálculo Automático:</p>
                      <p className="text-sm text-green-800">
                        FOB: <span className="font-bold">${item.costFob.toFixed(2)}</span> +
                        Aduana: <span className="font-bold">${(parseFloat(liquidationForm.aduanaCost) || 0).toFixed(2)}</span> +
                        Flete: <span className="font-bold">${(parseFloat(liquidationForm.fleteCourrierCost) || 0).toFixed(2)}</span> =
                        <span className="font-bold text-green-900 ml-2">
                          ${(item.costFob + (parseFloat(liquidationForm.aduanaCost) || 0) + (parseFloat(liquidationForm.fleteCourrierCost) || 0)).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Serial Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      📱 Serial Number del Producto Recibido *
                    </label>
                    <input
                      type="text"
                      value={liquidationForm.serialNumber}
                      onChange={(e) =>
                        setLiquidationForm({
                          ...liquidationForm,
                          serialNumber: e.target.value,
                        })
                      }
                      placeholder="Scanner o copia/pega del SN"
                      required
                      className="w-full px-3 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      💡 Escanea el código de barras o QR del producto físico
                    </p>
                  </div>

                  {/* Precios Finales */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">💵 Precios Finales (puedes ajustar)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Precio B2B
                        </label>
                        <input
                          type="number"
                          value={liquidationForm.priceB2B}
                          onChange={(e) =>
                            setLiquidationForm({
                              ...liquidationForm,
                              priceB2B: e.target.value,
                            })
                          }
                          step="0.01"
                          min="0"
                          className="w-full px-2 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Precio PVP (Público)
                        </label>
                        <input
                          type="number"
                          value={liquidationForm.pricePVP}
                          onChange={(e) =>
                            setLiquidationForm({
                              ...liquidationForm,
                              pricePVP: e.target.value,
                            })
                          }
                          step="0.01"
                          min="0"
                          className="w-full px-2 py-2 border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded text-sm transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={liquidating}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded text-sm transition"
                    >
                      {liquidating ? '⏳ Procesando...' : '✅ Confirmar Recepción'}
                    </button>
                  </div>
                </form>
              )}

              {/* Botón Expandir */}
              {expandedId !== item.id && (
                <button
                  onClick={() => handleRecibir(item)}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded transition"
                >
                  📦 Recibir Mercadería
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ ¿Cómo funciona?</h3>
        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
          <li>Llega el paquete a tu bodega</li>
          <li>Click en "Recibir Mercadería"</li>
          <li>Ingresa los costos de aduana y flete</li>
          <li>Escanea el Serial Number del producto recibido</li>
          <li>Ajusta precios si es necesario</li>
          <li>Click "Confirmar Recepción"</li>
          <li>✅ Producto pasa a DISPONIBLE y aparece en catálogo</li>
        </ol>
      </div>
    </div>
  );
}
