'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import PreparationRow from '@/components/PreparationRow';
import PreparationRowExpanded from '@/components/PreparationRowExpanded';

interface InventoryItem {
  id: number;
  productName: string;
  brand: string;
  model?: string;
  specs: string;
  internalCode: string;
  supplier: string;
  costFob?: number | null;
  priceReferential?: number;
  createdAt: string;
}

type ViewMode = 'compact' | 'detailed';

export default function PreparationList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getDaysToProcess = (createdAt: string): number => {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const fetchItems = async () => {
    try {
      const response = await api.get('/products/inventory/comprado');
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

  // Filtrar por búsqueda
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.productName.toLowerCase().includes(term) ||
        item.internalCode.toLowerCase().includes(term) ||
        item.supplier.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="inline-flex items-center gap-2 text-gray-600">
          <div className="animate-spin">⏳</div>
          <span>Cargando productos comprados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con Búsqueda y Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Búsqueda */}
        <div>
          <div className="relative">
            <svg
              className="absolute left-3 top-3 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, código o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Vista */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 self-end md:self-center">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'compact'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Compacta
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'detailed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h16v16H4z" />
              </svg>
              Detallada
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Productos</p>
            <p className="text-lg font-bold text-gray-900">{filtered.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Valor FOB Total</p>
            <p className="text-lg font-bold text-blue-600">
              ${filtered.reduce((sum, item) => sum + (item.costFob ?? 0), 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Promedio Días Esperando</p>
            <p className="text-lg font-bold text-yellow-600">
              {filtered.length > 0
                ? (filtered.reduce((sum, item) => sum + getDaysToProcess(item.createdAt), 0) / filtered.length).toFixed(0)
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Registros */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-600">No hay productos comprados</p>
          <p className="text-sm text-gray-500 mt-1">Todos los productos ya han sido procesados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header de Tabla (solo en vista compacta) */}
          {viewMode === 'compact' && (
            <div className="hidden md:grid md:grid-cols-12 items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <div className="col-span-3">Producto</div>
              <div className="col-span-2">Proveedor</div>
              <div className="col-span-2">Costo FOB</div>
              <div className="col-span-2">Días Esperando</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>
          )}

          {/* Filas */}
          {filtered.map((item) => (
            <div key={item.id} className={`${expandedId === item.id ? 'bg-yellow-50' : ''}`}>
              <PreparationRow
                id={item.id}
                productName={item.productName}
                internalCode={item.internalCode}
                supplier={item.supplier}
                costFob={item.costFob}
                daysWaiting={getDaysToProcess(item.createdAt)}
                isExpanded={expandedId === item.id}
                onExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />

              {/* Fila Expandida */}
              {expandedId === item.id && (
                <PreparationRowExpanded
                  id={item.id}
                  productName={item.productName}
                  brand={item.brand}
                  model={item.model}
                  specs={item.specs}
                  internalCode={item.internalCode}
                  supplier={item.supplier}
                  costFob={item.costFob}
                  createdAt={item.createdAt}
                  daysWaiting={getDaysToProcess(item.createdAt)}
                  onClose={() => setExpandedId(null)}
                  onSuccess={fetchItems}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
