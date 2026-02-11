'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';

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

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [customers, setCustomers] = useState<UserSummary[]>([]);

  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState<InventoryUpdateForm>(emptyEditForm);
  const [editSaving, setEditSaving] = useState(false);

  const [sellItem, setSellItem] = useState<InventoryItem | null>(null);
  const [sellForm, setSellForm] = useState<SaleForm>(emptySaleForm);
  const [sellStep, setSellStep] = useState<'reserve' | 'payment'>('reserve');
  const [sellSaving, setSellSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/inventory/list', {
        params: statusFilter ? { status: statusFilter } : {},
      });
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

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, []);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Serial, Codigo, Producto, Marca..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Todos los estados</option>
          <option value="DISPONIBLE">DISPONIBLE</option>
          <option value="RESERVADO">RESERVADO</option>
          <option value="EN_TRANSITO">EN_TRANSITO</option>
          <option value="VENDIDO">VENDIDO</option>
          <option value="DEFECTUOSO">DEFECTUOSO</option>
        </select>
        <button
          onClick={fetchInventory}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          Refrescar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Codigo</th>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">Serial</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">{item.internalCode}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{item.productName || 'Sin nombre'}</div>
                  <div className="text-xs text-gray-500">{item.brand} {item.model}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{item.serialNumber || 'N/A'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    item.status === 'DISPONIBLE' ? 'bg-green-100 text-green-700' :
                    item.status === 'RESERVADO' ? 'bg-yellow-100 text-yellow-700' :
                    item.status === 'VENDIDO' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs text-gray-500">B2B: ${item.priceB2B?.toFixed(2) || '0.00'}</div>
                  <div className="font-semibold">PVP: ${item.pricePVP?.toFixed(2) || '0.00'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={() => openEditModal(item)}
                    >
                      Editar
                    </button>
                    {item.status !== 'VENDIDO' && item.status !== 'EN_TRANSITO' && (
                      <button
                        className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                        onClick={() => openSellModal(item)}
                      >
                        Vender
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No hay productos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Editar Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border rounded px-3 py-2"
                placeholder="Nombre"
                value={editForm.productName}
                onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Marca"
                value={editForm.brand}
                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Modelo"
                value={editForm.model}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Serial"
                value={editForm.serialNumber}
                onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Proveedor"
                value={editForm.supplier}
                onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Precio Estimado"
                value={editForm.estimatedPrice}
                onChange={(e) => setEditForm({ ...editForm, estimatedPrice: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Precio B2B"
                value={editForm.priceB2B}
                onChange={(e) => setEditForm({ ...editForm, priceB2B: e.target.value })}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Precio PVP"
                value={editForm.pricePVP}
                onChange={(e) => setEditForm({ ...editForm, pricePVP: e.target.value })}
              />
            </div>
            <textarea
              className="border rounded px-3 py-2 w-full mt-4"
              placeholder="Especificaciones"
              rows={3}
              value={editForm.specs}
              onChange={(e) => setEditForm({ ...editForm, specs: e.target.value })}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeEditModal} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {editSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {sellItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Venta de Producto</h3>

            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="font-semibold">{sellItem.productName}</div>
              <div className="text-sm text-gray-600">{sellItem.internalCode} · {sellItem.serialNumber || 'Sin serial'}</div>
            </div>

            {sellStep === 'reserve' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Cliente</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={sellForm.customerId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSellForm({ ...sellForm, customerId: value, customerName: '' });
                      if (sellItem) {
                        fetchSuggestedPrice(sellItem.id, value);
                      }
                    }}
                  >
                    <option value="">Venta en mostrador</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.fullName} ({customer.role})
                      </option>
                    ))}
                  </select>
                </div>
                {!sellForm.customerId && (
                  <div>
                    <label className="text-sm text-gray-600">Nombre del cliente</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={sellForm.customerName}
                      onChange={(e) => setSellForm({ ...sellForm, customerName: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">Precio de venta</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={sellForm.salePrice}
                    onChange={(e) => setSellForm({ ...sellForm, salePrice: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={closeSellModal} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                  <button
                    onClick={handleReserve}
                    disabled={sellSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    {sellSaving ? 'Reservando...' : 'Reservar'}
                  </button>
                </div>
              </div>
            )}

            {sellStep === 'payment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Metodo de pago</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={sellForm.paymentMethod}
                      onChange={(e) => setSellForm({ ...sellForm, paymentMethod: e.target.value })}
                    >
                      <option value="CASH">Efectivo</option>
                      <option value="TRANSFER">Transferencia</option>
                      <option value="DATAFAST">Datafast</option>
                      <option value="DEUNA">Deuna</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Destino del dinero</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      placeholder="Caja o Banco"
                      value={sellForm.paymentDestination}
                      onChange={(e) => setSellForm({ ...sellForm, paymentDestination: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">URL comprobante (opcional)</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={sellForm.receiptUrl}
                      onChange={(e) => setSellForm({ ...sellForm, receiptUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Meses de garantia</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={sellForm.warrantyMonths}
                      onChange={(e) => setSellForm({ ...sellForm, warrantyMonths: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Precio final</p>
                    <p className="text-2xl font-bold">${sellForm.salePrice || '0.00'}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={closeSellModal} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                    <button
                      onClick={handleConfirmSale}
                      disabled={sellSaving}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      {sellSaving ? 'Confirmando...' : 'Confirmar Venta'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
