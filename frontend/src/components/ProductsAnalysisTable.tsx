'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface Product {
  id: number;
  internalCode: string;
  productName: string;
  brand: string;
  status: string;
  costFob: number;
  costShipping: number;
  costCustoms: number;
  priceB2B: number;
  pricePVP: number;
  serialNumber?: string;
  productOwner?: string;
}

interface ProductsAnalysisTableProps {
  statusFilter: string;
}

export default function ProductsAnalysisTable({ statusFilter }: ProductsAnalysisTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener productos del inventario con filtro de estado
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/products/inventory/list', { params });
      const allProducts = response.data || [];

      // Mapear a la interfaz correcta
      const mappedProducts = allProducts.map((p: any) => ({
        id: p.id,
        internalCode: p.internalCode,
        productName: p.productName,
        brand: p.brand,
        status: p.status,
        costFob: p.costFob || 0,
        costShipping: p.costShipping || 0,
        costCustoms: p.costCustoms || 0,
        priceB2B: p.priceB2B || 0,
        pricePVP: p.pricePVP || 0,
        serialNumber: p.serialNumber,
        productOwner: p.productOwner,
      }));

      setProducts(mappedProducts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; icon: string }> = {
      COMPRADO: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '🛒' },
      PREPARACION_ENVIO: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '📋' },
      EN_TRANSITO: { bg: 'bg-orange-100', text: 'text-orange-800', icon: '✈️' },
      STOCK_LOCAL: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '📦' },
      DISPONIBLE: { bg: 'bg-teal-100', text: 'text-teal-800', icon: '✅' },
      VENDIDO: { bg: 'bg-green-100', text: 'text-green-800', icon: '💰' },
    };
    const status_info = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓' };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status_info.bg} ${status_info.text} whitespace-nowrap`}>
        {status_info.icon} {status}
      </span>
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.internalCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.serialNumber && product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculateStats = () => {
    if (filteredProducts.length === 0) return { totalCost: 0, totalRevenue: 0, totalGain: 0 };

    const totalCost = filteredProducts.reduce((sum, p) => sum + (p.costFob + p.costShipping + p.costCustoms), 0);
    const totalRevenue = filteredProducts.reduce((sum, p) => sum + p.priceB2B, 0);
    const totalGain = totalRevenue - totalCost;

    return { totalCost, totalRevenue, totalGain };
  };

  const stats = calculateStats();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, código o serial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Stats Summary */}
      {!loading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-xs font-semibold text-gray-700 uppercase">Total Costo Invertido</p>
            <p className="text-2xl font-bold text-orange-700 mt-2">${stats.totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-semibold text-gray-700 uppercase">Ingresos (B2B)</p>
            <p className="text-2xl font-bold text-blue-700 mt-2">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs font-semibold text-gray-700 uppercase">Ganancia Total</p>
            <p className="text-2xl font-bold text-green-700 mt-2">${stats.totalGain.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-xs font-semibold text-gray-700 uppercase">Productos</p>
            <p className="text-2xl font-bold text-purple-700 mt-2">{filteredProducts.length}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay productos que mostrar</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && filteredProducts.length > 0 && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Código/Producto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Marca</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Costo Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Precio B2B</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Precio PVP</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Ganancia</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Margen %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const landedCost = product.costFob + product.costShipping + product.costCustoms;
                const gain = product.priceB2B - landedCost;
                const marginPercent = landedCost > 0 ? ((gain / landedCost) * 100) : 0;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{product.productName}</p>
                        <p className="text-xs font-mono text-gray-500">{product.internalCode}</p>
                        {product.serialNumber && (
                          <p className="text-xs text-gray-400">Serial: {product.serialNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.brand}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(product.status)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div>
                        <p className="font-semibold text-orange-700">${landedCost.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">FOB: ${product.costFob.toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <p className="font-semibold text-blue-700">${product.priceB2B.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <p className="font-semibold text-green-700">${product.pricePVP.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <p className={`font-semibold ${gain >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${gain.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        marginPercent >= 20 ? 'bg-green-100 text-green-800' :
                        marginPercent >= 10 ? 'bg-blue-100 text-blue-800' :
                        marginPercent >= 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {marginPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
