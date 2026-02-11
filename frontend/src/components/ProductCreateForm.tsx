'use client';

import { useState } from 'react';
import { productService } from '@/services/api';
import { CreateProductDTO, CreateProductVariantDTO, Product, ProductVariant } from '@/types';

export default function ProductCreateForm() {
  // State para el producto
  const [productData, setProductData] = useState<CreateProductDTO>({
    name: '',
    brand: '',
    model: '',
    category: '',
    description: '',
  });

  // State para la variante actual
  const [variantData, setVariantData] = useState<Partial<CreateProductVariantDTO>>({
    sku: '',
    costPrice: 0,
    priceB2B: 0,
    pricePVP: 0,
    attributes: {},
  });

  // State adicional
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [createdVariants, setCreatedVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'product' | 'variant'>('product');

  // Atributos dinámicos para la variante
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const product = await productService.createProduct(productData);
      setCreatedProduct(product);
      setVariantData({ ...variantData, productId: product.id });
      setSuccess(`✅ Producto "${product.name}" creado exitosamente. Ahora agrega variantes (SKU).`);
      setStep('variant');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createdProduct) {
      setError('Primero debes crear un producto');
      return;
    }

    // Validar precios
    if (variantData.pricePVP! <= variantData.priceB2B!) {
      setError('El precio PVP debe ser mayor al precio B2B');
      return;
    }
    if (variantData.priceB2B! <= variantData.costPrice!) {
      setError('El precio B2B debe ser mayor al costo FOB');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const variant = await productService.createVariant(variantData as CreateProductVariantDTO);
      setCreatedVariants([...createdVariants, variant]);
      setSuccess(`✅ Variante "${variant.sku}" agregada exitosamente`);
      
      // Reset variant form
      setVariantData({
        productId: createdProduct.id,
        sku: '',
        costPrice: 0,
        priceB2B: 0,
        pricePVP: 0,
        attributes: {},
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la variante');
    } finally {
      setLoading(false);
    }
  };

  const addAttribute = () => {
    if (attributeKey && attributeValue) {
      setVariantData({
        ...variantData,
        attributes: {
          ...variantData.attributes,
          [attributeKey]: attributeValue,
        },
      });
      setAttributeKey('');
      setAttributeValue('');
    }
  };

  const removeAttribute = (key: string) => {
    const newAttributes = { ...variantData.attributes };
    delete newAttributes[key];
    setVariantData({ ...variantData, attributes: newAttributes });
  };

  const resetForm = () => {
    setProductData({
      name: '',
      brand: '',
      model: '',
      category: '',
      description: '',
    });
    setVariantData({
      sku: '',
      costPrice: 0,
      priceB2B: 0,
      pricePVP: 0,
      attributes: {},
    });
    setCreatedProduct(null);
    setCreatedVariants([]);
    setStep('product');
    setSuccess('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Agregar Nuevo Producto</h1>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Formulario de Producto */}
      {step === 'product' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Paso 1: Información del Producto</h2>
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: Laptop ProBook 15.6&quot;"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Marca *</label>
                <input
                  type="text"
                  value={productData.brand}
                  onChange={(e) => setProductData({ ...productData, brand: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: HP"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modelo *</label>
                <input
                  type="text"
                  value={productData.model}
                  onChange={(e) => setProductData({ ...productData, model: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ej: ProBook 450 G9"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Monitores">Monitores</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Componentes">Componentes</option>
                  <option value="Periféricos">Periféricos</option>
                  <option value="Almacenamiento">Almacenamiento</option>
                  <option value="Networking">Networking</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Descripción detallada del producto..."
                rows={3}
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creando...' : 'Crear Producto y Continuar'}
            </button>
          </form>
        </div>
      )}

      {/* Formulario de Variantes */}
      {step === 'variant' && createdProduct && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900">Producto Base Creado</h3>
            <p className="text-blue-700">
              {createdProduct.brand} - {createdProduct.name} ({createdProduct.model})
            </p>
            <p className="text-sm text-blue-600 mt-1">
              ID: {createdProduct.id} | Categoría: {createdProduct.category}
            </p>
          </div>

          {/* Lista de variantes creadas */}
          {createdVariants.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Variantes Agregadas ({createdVariants.length})</h3>
              <div className="space-y-2">
                {createdVariants.map((variant) => (
                  <div key={variant.id} className="flex justify-between items-center text-sm">
                    <span className="font-mono">{variant.sku}</span>
                    <span className="text-gray-600">
                      FOB: ${variant.costPrice} | B2B: ${variant.priceB2B} | PVP: ${variant.pricePVP}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Paso 2: Agregar Variante (SKU)</h2>
            <form onSubmit={handleVariantSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU (Código Único) *</label>
                <input
                  type="text"
                  value={variantData.sku}
                  onChange={(e) => setVariantData({ ...variantData, sku: e.target.value })}
                  className="w-full border rounded px-3 py-2 font-mono"
                  placeholder="Ej: HP-PB450-I7-16GB-512SSD"
                  required
                  minLength={3}
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  El SKU debe ser único en todo el sistema
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Costo FOB * ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={variantData.costPrice}
                    onChange={(e) => setVariantData({ ...variantData, costPrice: parseFloat(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio B2B * ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={variantData.priceB2B}
                    onChange={(e) => setVariantData({ ...variantData, priceB2B: parseFloat(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio PVP * ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={variantData.pricePVP}
                    onChange={(e) => setVariantData({ ...variantData, pricePVP: parseFloat(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                💡 Recuerda: PVP &gt; B2B &gt; FOB
              </div>

              {/* Atributos dinámicos */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Atributos Técnicos (Opcional)</h3>
                
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <input
                    type="text"
                    value={attributeKey}
                    onChange={(e) => setAttributeKey(e.target.value)}
                    placeholder="Nombre (ej: RAM)"
                    className="border rounded px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    value={attributeValue}
                    onChange={(e) => setAttributeValue(e.target.value)}
                    placeholder="Valor (ej: 16GB DDR4)"
                    className="border rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addAttribute}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm"
                  >
                    + Agregar
                  </button>
                </div>

                {Object.keys(variantData.attributes || {}).length > 0 && (
                  <div className="space-y-1">
                    {Object.entries(variantData.attributes || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded text-sm">
                        <span>
                          <strong>{key}:</strong> {String(value)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttribute(key)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Guardando...' : 'Agregar Variante'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
                >
                  ✓ Finalizar
                </button>
              </div>
            </form>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Puedes agregar múltiples variantes para este producto. Cuando termines, haz clic en "Finalizar".
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
