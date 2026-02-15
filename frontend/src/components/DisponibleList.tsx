'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import DisponibleRow from '@/components/DisponibleRow';
import DisponibleRowExpanded from '@/components/DisponibleRowExpanded';

interface InventoryItem {
  id: number;
  productName: string;
  brand: string;
  model?: string;
  specs: string;
  internalCode: string;
  supplier: string;
  costFob: number;
  costShipping?: number;
  costCustoms?: number;
  serialNumber?: string;
  priceB2B?: number;
  pricePVP?: number;
  productOwner?: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function DisponibleList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getDaysInStock = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/products/inventory/disponible');
      setItems(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay productos DISPONIBLES</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Producto</div>
          <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio PVP</div>
          <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Precio B2B</div>
          <div className="col-span-1 text-xs font-semibold text-gray-700 uppercase tracking-wider">Días</div>
          <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider text-right">Acciones</div>
        </div>

        {/* Rows */}
        {filteredItems.map((item) => (
          <div key={item.id}>
            <DisponibleRow
              id={item.id}
              productName={item.productName}
              internalCode={item.internalCode}
              pricePVP={item.pricePVP || 0}
              priceB2B={item.priceB2B || 0}
              daysInStock={getDaysInStock(item.createdAt)}
              isExpanded={expandedId === item.id}
              onExpand={(id: number) => setExpandedId(expandedId === id ? null : id)}
            />
            {expandedId === item.id && (
              <DisponibleRowExpanded
                id={item.id}
                productName={item.productName}
                brand={item.brand}
                model={item.model}
                specs={item.specs}
                internalCode={item.internalCode}
                supplier={item.supplier}
                costFob={item.costFob}
                costShipping={item.costShipping}
                costCustoms={item.costCustoms}
                serialNumber={item.serialNumber}
                priceB2B={item.priceB2B}
                pricePVP={item.pricePVP}
                productOwner={item.productOwner}
                trackingNumber={item.trackingNumber}
                createdAt={item.createdAt}
                daysInStock={getDaysInStock(item.createdAt)}
                onClose={() => setExpandedId(null)}
                onSuccess={() => {
                  setExpandedId(null);
                  fetchItems();
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
