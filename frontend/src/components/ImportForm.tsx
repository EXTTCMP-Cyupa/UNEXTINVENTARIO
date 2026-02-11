'use client';

import { useState } from 'react';
import { ImportItem, InventorySN } from '@/types';
import { importService } from '@/services/api';

export default function ImportForm() {
  const [provider, setProvider] = useState('');
  const [freightCost, setFreightCost] = useState('');
  const [customsCost, setCustomsCost] = useState('');
  const [extrasCost, setExtrasCost] = useState('');
  const [items, setItems] = useState<ImportItem[]>([]);
  const [currentItem, setCurrentItem] = useState<Partial<ImportItem>>({
    serialNumbers: [],
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const addItem = () => {
    if (currentItem.sku && currentItem.costPrice && currentItem.quantity) {
      setItems([...items, currentItem as ImportItem]);
      setCurrentItem({ serialNumbers: [] });
    }
  };

  const calculateProjectedCost = () => {
    const totalFobSum = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const additionalCosts = parseFloat(freightCost || '0') + parseFloat(customsCost || '0') + parseFloat(extrasCost || '0');
    const prorationFactor = totalFobSum > 0 ? additionalCosts / totalFobSum : 0;

    return items.map((item) => {
      const landedCost = item.costPrice * (1 + prorationFactor);
      return {
        sku: item.sku,
        unitPrice: item.costPrice,
        projectedCost: landedCost.toFixed(2),
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await importService.processImport({
        provider,
        freightCost: parseFloat(freightCost),
        customsCost: parseFloat(customsCost),
        extrasCost: parseFloat(extrasCost),
        items,
      });
      setSuccessMessage('Importación procesada exitosamente');
      // Reset form
      setProvider('');
      setFreightCost('');
      setCustomsCost('');
      setExtrasCost('');
      setItems([]);
    } catch (error) {
      console.error('Error processing import:', error);
    } finally {
      setLoading(false);
    }
  };

  const projectedCosts = calculateProjectedCost();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Ingreso de Mercadería</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Información base */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Proveedor"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Costo de Envío"
            value={freightCost}
            onChange={(e) => setFreightCost(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Costo de Aduanas"
            value={customsCost}
            onChange={(e) => setCustomsCost(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder="Otros Gastos"
            value={extrasCost}
            onChange={(e) => setExtrasCost(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Items */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Agregar Ítems</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="SKU"
              value={currentItem.sku || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, sku: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Costo FOB"
              value={currentItem.costPrice || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, costPrice: parseFloat(e.target.value) })}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Cantidad"
              value={currentItem.quantity || ''}
              onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-secondary text-white rounded hover:bg-green-700"
          >
            Agregar Ítem
          </button>
        </div>

        {/* Items agregados */}
        {items.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Costos Proyectados Unitarios</h2>
            <div className="space-y-2">
              {projectedCosts.map((item, idx) => (
                <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>{item.sku}</span>
                  <span className="text-gray-600">FOB: ${item.unitPrice}</span>
                  <span className="font-semibold text-secondary">Real: ${item.projectedCost}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full px-4 py-3 bg-primary text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Procesar Importación'}
        </button>
      </form>
    </div>
  );
}
