'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import InventoryIngresoForm from '@/components/InventoryIngresoForm';
import QuickActionButtons from '@/components/QuickActionButtons';

interface InventoryItem {
  id: number;
  internalCode: string;
  serialNumber?: string;
  status: string;
  productName?: string;
  brand?: string;
  model?: string;
  specs?: string;
  supplier?: string;
  purchaseType?: string;
  estimatedPrice?: number;
  priceB2B?: number;
  pricePVP?: number;
  landedCost?: number;
  reservedToCustomer?: string;
  reservedDate?: string;
  reservedPrice?: number;
  soldToCustomer?: string;
  soldDate?: string;
  createdAt?: string;
}

interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

interface InventoryUpdateForm {
  productName: string;
  brand: string;
  model: string;
  specs: string;
  supplier: string;
  serialNumber: string;
  estimatedPrice: string;
  priceB2B: string;
  pricePVP: string;
}

interface SaleForm {
  customerId: string;
  customerName: string;
  salePrice: string;
  paymentMethod: string;
  paymentDestination: string;
  receiptUrl: string;
  warrantyMonths: string;
}

const emptyEditForm: InventoryUpdateForm = {
  productName: '',
  brand: '',
  model: '',
  specs: '',
  supplier: '',
  serialNumber: '',
  estimatedPrice: '',
  priceB2B: '',
  pricePVP: '',
};

const emptySaleForm: SaleForm = {
  customerId: '',
  customerName: '',
  salePrice: '',
  paymentMethod: 'CASH',
  paymentDestination: '',
  receiptUrl: '',
  warrantyMonths: '3',
};

interface InventoryListProps {
  initialFilter?: string;
}

export default function InventoryList({ initialFilter }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(initialFilter || '');
  const [searchTerm, setSearchTerm] = useState('');

  const [customers, setCustomers] = useState<UserSummary[]>([]);

  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState<InventoryUpdateForm>(emptyEditForm);
  const [editSaving, setEditSaving] = useState(false);

  const [sellItem, setSellItem] = useState<InventoryItem | null>(null);
  const [sellForm, setSellForm] = useState<SaleForm>(emptySaleForm);
  const [sellStep, setSellStep] = useState<'reserve' | 'payment'>('reserve');
  const [sellSaving, setSellSaving] = useState(false);

  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showIngresoModal, setShowIngresoModal] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      console.log('Fetching inventory with status filter:', statusFilter);
      const response = await api.get('/products/inventory/list', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      console.log('Inventory response:', response.data);
      setItems(response.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/users');
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Fetch inventory when statusFilter changes
  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Load initial data if initialFilter is provided
  useEffect(() => {
    if (initialFilter) {
      fetchInventory();
    }
  }, [initialFilter]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.internalCode?.toLowerCase().includes(term) ||
      item.serialNumber?.toLowerCase().includes(term) ||
      item.productName?.toLowerCase().includes(term) ||
      item.brand?.toLowerCase().includes(term) ||
      item.model?.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const openEditModal = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({
      productName: item.productName || '',
      brand: item.brand || '',
      model: item.model || '',
      specs: item.specs || '',
      supplier: item.supplier || '',
      serialNumber: item.serialNumber || '',
      estimatedPrice: item.estimatedPrice?.toString() || '',
      priceB2B: item.priceB2B?.toString() || '',
      pricePVP: item.pricePVP?.toString() || '',
    });
  };

  const closeEditModal = () => {
    setEditItem(null);
    setEditForm(emptyEditForm);
  };

  const handleEditSave = async () => {
    if (!editItem) return;
    setEditSaving(true);
    try {
      await api.put(`/products/inventory/${editItem.id}`, {
        productName: editForm.productName || null,
        brand: editForm.brand || null,
        model: editForm.model || null,
        specs: editForm.specs || null,
        supplier: editForm.supplier || null,
        serialNumber: editForm.serialNumber || null,
        estimatedPrice: editForm.estimatedPrice ? Number(editForm.estimatedPrice) : null,
        priceB2B: editForm.priceB2B ? Number(editForm.priceB2B) : null,
        pricePVP: editForm.pricePVP ? Number(editForm.pricePVP) : null,
      });
      closeEditModal();
      fetchInventory();
    } catch (err: any) {
      console.error('Error updating inventory:', err);
      alert(err.response?.data?.message || 'No se pudo guardar los cambios');
    } finally {
      setEditSaving(false);
    }
  };

  const openSellModal = (item: InventoryItem) => {
    setSellItem(item);
    setSellForm({
      ...emptySaleForm,
      salePrice: item.pricePVP?.toString() || '',
    });
    setSellStep(item.status === 'RESERVADO' ? 'payment' : 'reserve');
  };

  const closeSellModal = () => {
    setSellItem(null);
    setSellForm(emptySaleForm);
    setSellStep('reserve');
  };

  const fetchSuggestedPrice = async (inventoryItemId: number, customerId?: string) => {
    try {
      const response = await api.get('/sales/price', {
        params: {
          inventoryItemId,
          customerId: customerId || undefined,
        },
      });
      const value = response.data;
      if (value !== null && value !== undefined) {
        setSellForm(prev => ({
          ...prev,
          salePrice: Number(value).toFixed(2),
        }));
      }
    } catch (err) {
      console.error('Error fetching price:', err);
    }
  };

  const handleReserve = async () => {
    if (!sellItem) return;
    setSellSaving(true);
    try {
      await api.post('/sales/reserve', {
        inventoryItemId: sellItem.id,
        customerId: sellForm.customerId ? Number(sellForm.customerId) : null,
        customerName: sellForm.customerName || null,
        overridePrice: sellForm.salePrice ? Number(sellForm.salePrice) : null,
      });
      setSellStep('payment');
      fetchInventory();
    } catch (err: any) {
      console.error('Error reserving sale:', err);
      alert(err.response?.data?.message || 'No se pudo reservar el producto');
    } finally {
      setSellSaving(false);
    }
  };

  const handleConfirmSale = async () => {
    if (!sellItem) return;
    if (!sellForm.paymentDestination) {
      alert('Selecciona el destino del dinero (caja o banco)');
      return;
    }

    setSellSaving(true);
    try {
      await api.post('/sales/confirm', {
        inventoryItemId: sellItem.id,
        customerId: sellForm.customerId ? Number(sellForm.customerId) : null,
        customerName: sellForm.customerName || null,
        paymentMethod: sellForm.paymentMethod,
        paymentDestination: sellForm.paymentDestination,
        receiptUrl: sellForm.receiptUrl || null,
        salePrice: sellForm.salePrice ? Number(sellForm.salePrice) : null,
        warrantyMonths: sellForm.warrantyMonths ? Number(sellForm.warrantyMonths) : null,
      });
      closeSellModal();
      fetchInventory();
    } catch (err: any) {
      console.error('Error confirming sale:', err);
      alert(err.response?.data?.message || 'No se pudo confirmar la venta');
    } finally {
      setSellSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando inventario...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Buscar por Serial, Código, Producto, Marca..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="COMPRADO">COMPRADO</option>
                <option value="EN_TRANSITO">EN_TRANSITO</option>
                <option value="STOCK_EN_LOCAL">STOCK_EN_LOCAL</option>
                <option value="VENDIDO">VENDIDO</option>
                <option value="DEFECTUOSO">DEFECTUOSO</option>
              </select>
              <button
                onClick={() => setShowIngresoModal(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                📦 Ingresar Mercadería
              </button>
              <button
                onClick={fetchInventory}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Refrescar
              </button>
            </div>
          </div>
        </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Serial
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Precios
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item, idx) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors h-16 ${idx % 2 === 1 ? 'bg-gray-25' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-gray-900">{item.internalCode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{item.productName || 'Sin nombre'}</div>
                    <div className="text-xs text-gray-500">{item.brand} {item.model}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono text-gray-600">{item.serialNumber || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.status === 'DISPONIBLE' && <Badge variant="success">DISPONIBLE</Badge>}
                    {item.status === 'RESERVADO' && <Badge variant="warning">RESERVADO</Badge>}
                    {item.status === 'VENDIDO' && <Badge variant="info">VENDIDO</Badge>}
                    {item.status === 'EN_TRANSITO' && <Badge variant="purple">EN_TRANSITO</Badge>}
                    {item.status === 'STOCK_EN_LOCAL' && <Badge variant="warning">STOCK_EN_LOCAL</Badge>}
                    {item.status === 'COMPRADO' && <Badge variant="default">COMPRADO</Badge>}
                    {item.status === 'DEFECTUOSO' && <Badge variant="danger">DEFECTUOSO</Badge>}
                    {!['DISPONIBLE', 'RESERVADO', 'VENDIDO', 'EN_TRANSITO', 'STOCK_EN_LOCAL', 'COMPRADO', 'DEFECTUOSO'].includes(item.status) && (
                      <Badge variant="default">{item.status}</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500">B2B: ${item.priceB2B?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm font-semibold text-gray-900">PVP: ${item.pricePVP?.toFixed(2) || '0.00'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2 flex-wrap">
                      <QuickActionButtons item={item} onActionComplete={fetchInventory} />
                      <button
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                        onClick={() => openEditModal(item)}
                      >
                        ✏️ Editar
                      </button>
                      {item.status !== 'VENDIDO' && item.status !== 'COMPRADO' && (
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          onClick={() => openSellModal(item)}
                        >
                          💰 Vender
                        </button>
                      )}
                      {item.status !== 'VENDIDO' && (
                        <button
                          className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                          onClick={() => setDeleteItem(item)}
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📦</span>
                      <p>No hay productos para mostrar</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">✏️ Editar Producto</h3>
              <p className="text-sm text-gray-600 mt-1">Actualiza la información del producto</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Producto</label>
                  <input
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Laptop Dell Latitude"
                    value={editForm.productName}
                    onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Marca</label>
                  <input
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Dell"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
                  <input
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Latitude 5420"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Serial Number</label>
                  <input
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="Serial del fabricante"
                    value={editForm.serialNumber}
                    onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
                  <input
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Amazon, eBay"
                    value={editForm.supplier}
                    onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio Estimado</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    value={editForm.estimatedPrice}
                    onChange={(e) => setEditForm({ ...editForm, estimatedPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio B2B</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    value={editForm.priceB2B}
                    onChange={(e) => setEditForm({ ...editForm, priceB2B: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Precio PVP</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    value={editForm.pricePVP}
                    onChange={(e) => setEditForm({ ...editForm, pricePVP: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Especificaciones Técnicas</label>
                <textarea
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: i5-11400H, 16GB RAM, 512GB SSD"
                  rows={3}
                  value={editForm.specs}
                  onChange={(e) => setEditForm({ ...editForm, specs: e.target.value })}
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={closeEditModal} 
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editSaving ? 'Guardando...' : '✓ Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {sellItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">💰 Venta de Producto</h3>
              <p className="text-sm text-gray-600 mt-1">
                {sellStep === 'reserve' ? 'Paso 1: Reserva del producto' : 'Paso 2: Confirmación de pago'}
              </p>
            </div>

            <div className="p-6">
              {/* Product Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📦</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{sellItem.productName}</div>
                    <div className="text-sm text-gray-600">{sellItem.internalCode} · {sellItem.serialNumber || 'Sin serial'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Precio sugerido</div>
                    <div className="text-2xl font-bold text-blue-600">${sellItem.pricePVP?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </div>

              {sellStep === 'reserve' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Cliente</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={sellForm.customerId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSellForm({ ...sellForm, customerId: value, customerName: '' });
                        if (sellItem) {
                          fetchSuggestedPrice(sellItem.id, value);
                        }
                      }}
                    >
                      <option value="">🏪 Venta en mostrador (sin registro)</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          👤 {customer.fullName} ({customer.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {!sellForm.customerId && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Nombre del cliente (opcional)</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Juan Pérez"
                        value={sellForm.customerName}
                        onChange={(e) => setSellForm({ ...sellForm, customerName: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Precio de venta final</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        value={sellForm.salePrice}
                        onChange={(e) => setSellForm({ ...sellForm, salePrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {sellStep === 'payment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Método de pago</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={sellForm.paymentMethod}
                        onChange={(e) => setSellForm({ ...sellForm, paymentMethod: e.target.value })}
                      >
                        <option value="CASH">💵 Efectivo</option>
                        <option value="TRANSFER">🏦 Transferencia</option>
                        <option value="DATAFAST">💳 Datafast</option>
                        <option value="DEUNA">📱 Deuna</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Destino del dinero *</label>
                      <input
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Caja chica, Banco Pichincha"
                        value={sellForm.paymentDestination}
                        onChange={(e) => setSellForm({ ...sellForm, paymentDestination: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">URL comprobante (opcional)</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                        value={sellForm.receiptUrl}
                        onChange={(e) => setSellForm({ ...sellForm, receiptUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Meses de garantía</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3"
                        value={sellForm.warrantyMonths}
                        onChange={(e) => setSellForm({ ...sellForm, warrantyMonths: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-green-700 uppercase mb-1">Precio final de venta</p>
                        <p className="text-3xl font-bold text-green-700">${sellForm.salePrice || '0.00'}</p>
                      </div>
                      <span className="text-4xl">💰</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button 
                onClick={closeSellModal} 
                className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              {sellStep === 'reserve' && (
                <button
                  onClick={handleReserve}
                  disabled={sellSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sellSaving ? 'Reservando...' : '→ Continuar a Pago'}
                </button>
              )}
              {sellStep === 'payment' && (
                <button
                  onClick={handleConfirmSale}
                  disabled={sellSaving}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sellSaving ? 'Confirmando...' : '✓ Confirmar Venta'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">⚠️ Confirmar Eliminación</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de eliminar el siguiente producto?
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{deleteItem.productName || 'Sin nombre'}</div>
                  <div className="text-gray-600">{deleteItem.brand} {deleteItem.model}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">Código: {deleteItem.internalCode}</div>
                  {deleteItem.serialNumber && (
                    <div className="text-xs text-gray-500 font-mono">Serial: {deleteItem.serialNumber}</div>
                  )}
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                disabled={deleteLoading}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    setDeleteLoading(true);
                    await api.delete(`/products/inventory/${deleteItem.id}`);
                    alert('✓ Producto eliminado exitosamente');
                    setDeleteItem(null);
                    fetchInventory();
                  } catch (err: any) {
                    console.error('Error deleting item:', err);
                    alert(err.response?.data?.message || 'Error al eliminar el producto. No se pueden eliminar productos vendidos.');
                  } finally {
                    setDeleteLoading(false);
                  }
                }}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showIngresoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div>
                <h3 className="text-xl font-bold text-gray-900">📦 Ingreso de Mercadería</h3>
                <p className="text-sm text-gray-600 mt-1">Registra nuevos productos en el inventario</p>
              </div>
              <button
                onClick={() => {
                  setShowIngresoModal(false);
                  fetchInventory();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <InventoryIngresoForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
