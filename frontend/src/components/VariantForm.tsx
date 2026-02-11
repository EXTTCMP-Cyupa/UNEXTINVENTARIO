'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface VariantFormProps {
  productId?: number;
  onSuccess?: () => void;
}

interface Product {
  id: number;
  name: string;
  brand: string;
}

export default function VariantForm({ productId, onSuccess }: VariantFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { token } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    productId: productId || '',
    sku: '',
    costPrice: '',
    priceB2B: '',
    pricePVP: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!token) return;
        const response = await api.get('/dev/products');
        // Idealmente debería haber un endpoint que solo liste productos sin variantes
        // Por ahora usamos /dev/products pero esto depende de la API real
      } catch (err) {
        console.error('Error loading products:', err);
      }
    };

    if (mounted) {
      fetchProducts();
    }
  }, [mounted, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!token) {
        throw new Error('No autenticado - por favor inicia sesión');
      }

      // Validar que los precios sean correctos
      const costPrice = parseFloat(formData.costPrice);
      const priceB2B = parseFloat(formData.priceB2B);
      const pricePVP = parseFloat(formData.pricePVP);

      if (priceB2B <= costPrice) {
        throw new Error('Precio B2B debe ser mayor al costo FOB');
      }
      if (pricePVP <= priceB2B) {
        throw new Error('Precio PVP debe ser mayor al precio B2B');
      }

      const payload = {
        productId: parseInt(formData.productId as string),
        sku: formData.sku,
        costPrice: costPrice,
        priceB2B: priceB2B,
        pricePVP: pricePVP,
      };

      const response = await api.post('/products/variants', payload);

      setSuccess(true);
      setFormData({
        productId: productId || '',
        sku: '',
        costPrice: '',
        priceB2B: '',
        pricePVP: '',
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al crear variante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Variante (SKU)</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ Variante creada exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID del Producto *
            </label>
            <input
              type="number"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              placeholder="ej: 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Obten el ID al crear el producto</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU (Código único) *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              placeholder="ej: HP-PB450-I7-16GB-512SSD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo FOB (USD) *
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="ej: 520.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio B2B (USD) *
            </label>
            <input
              type="number"
              name="priceB2B"
              value={formData.priceB2B}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="ej: 630.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Debe ser mayor al costo FOB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio PVP (USD) *
            </label>
            <input
              type="number"
              name="pricePVP"
              value={formData.pricePVP}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="ej: 750.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Debe ser mayor al precio B2B</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-sm text-blue-700">
            <strong>Validación de precios:</strong> PVP {'>'} Precio B2B {'>'} Costo FOB
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-md transition"
        >
          {loading ? 'Creando...' : 'Crear Variante'}
        </button>
      </form>
    </div>
  );
}
