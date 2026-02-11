'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

type Step = 'origin' | 'details';
type Origin = 'INTERNATIONAL' | 'LOCAL' | null;

export default function InventoryIngresoForm() {
  const [step, setStep] = useState<Step>('origin');
  const [origin, setOrigin] = useState<Origin>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { token } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    // Ficha Técnica
    productName: '',
    brand: '',
    model: '',
    specs: '',
    
    // Internacional específico
    costFob: '',
    estimatedPrice: '',
    
    // Local específico
    serialNumber: '',
    costInvoice: '',
    extraCosts: '',
    priceB2B: '',
    pricePVP: '',
    
    // Común
    supplier: '',
  });

  const handleOriginSelect = (selected: Origin) => {
    setOrigin(selected);
    setStep('details');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!token) throw new Error('No autenticado');
      if (!formData.productName) throw new Error('Ingresa nombre del producto');
      if (!formData.brand) throw new Error('Ingresa marca');
      if (!formData.model) throw new Error('Ingresa modelo');
      if (!formData.supplier) throw new Error('Ingresa proveedor');

      let endpoint = '';
      let payload: any = {
        productName: formData.productName,
        brand: formData.brand,
        model: formData.model,
        specs: formData.specs,
        supplier: formData.supplier,
      };

      if (origin === 'INTERNATIONAL') {
        if (!formData.costFob) throw new Error('Ingresa costo FOB');
        if (!formData.estimatedPrice) throw new Error('Ingresa precio estimado');

        const costFob = parseFloat(formData.costFob);
        const estimatedPrice = parseFloat(formData.estimatedPrice);

        if (costFob <= 0) throw new Error('Costo FOB debe ser mayor a 0');
        if (estimatedPrice <= costFob) throw new Error('Precio estimado debe ser mayor a FOB');

        endpoint = '/products/inventory/ingreso/international';
        payload = {
          ...payload,
          costFob,
          estimatedPrice,
        };
      } else if (origin === 'LOCAL') {
        if (!formData.serialNumber) throw new Error('Escanea Serial Number');
        if (!formData.costInvoice) throw new Error('Ingresa costo de factura');
        if (!formData.priceB2B) throw new Error('Ingresa precio B2B');
        if (!formData.pricePVP) throw new Error('Ingresa precio PVP');

        const costInvoice = parseFloat(formData.costInvoice);
        const extraCosts = formData.extraCosts ? parseFloat(formData.extraCosts) : 0;
        const priceB2B = parseFloat(formData.priceB2B);
        const pricePVP = parseFloat(formData.pricePVP);
        const landedCost = costInvoice + extraCosts;

        if (costInvoice <= 0) throw new Error('Costo debe ser mayor a 0');
        if (priceB2B <= landedCost) throw new Error('Precio B2B debe ser mayor al costo total');
        if (pricePVP <= priceB2B) throw new Error('Precio PVP debe ser mayor a B2B');

        endpoint = '/products/inventory/ingreso/local';
        payload = {
          ...payload,
          serialNumber: formData.serialNumber,
          costInvoice,
          extraCosts: extraCosts > 0 ? extraCosts : null,
          priceB2B,
          pricePVP,
        };
      }

      await api.post(endpoint, payload);
      setSuccess(true);
      setStep('origin');
      setOrigin(null);
      setFormData({
        productName: '',
        brand: '',
        model: '',
        specs: '',
        costFob: '',
        estimatedPrice: '',
        serialNumber: '',
        costInvoice: '',
        extraCosts: '',
        priceB2B: '',
        pricePVP: '',
        supplier: '',
      });

      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al ingresar producto');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  // PASO 1: Seleccionar Origen
  if (step === 'origin') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-3xl font-bold mb-2 text-gray-900">📦 Nuevo Ingreso de Mercadería</h2>
        <p className="text-gray-600 mb-8">Selecciona dónde compraste el producto:</p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            ✅ Producto ingresado exitosamente
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Botón Internacional */}
          <button
            onClick={() => handleOriginSelect('INTERNATIONAL')}
            className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-gradient-to-br from-blue-50 to-blue-100 p-8 hover:border-blue-500 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Compra Internacional</h3>
            <p className="text-blue-700 mb-4">eBay, Amazon, AliExpress, China</p>
            <ul className="text-sm text-blue-600 space-y-1 text-left">
              <li>✓ Entra como <span className="font-semibold text-red-600">EN TRÁNSITO</span></li>
              <li>✓ Stock: 0 por ahora</li>
              <li>✓ Dice "Llega pronto" en la web</li>
              <li>✓ Después pagas aduana y flete</li>
            </ul>
          </button>

          {/* Botón Local */}
          <button
            onClick={() => handleOriginSelect('LOCAL')}
            className="group relative overflow-hidden rounded-lg border-2 border-transparent bg-gradient-to-br from-green-50 to-green-100 p-8 hover:border-green-500 transition transform hover:scale-105"
          >
            <div className="text-5xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold text-green-900 mb-2">Compra Local</h3>
            <p className="text-green-700 mb-4">Distribuidores, mayoristas nacionales</p>
            <ul className="text-sm text-green-600 space-y-1 text-left">
              <li>✓ Entra como <span className="font-semibold text-green-600">DISPONIBLE</span></li>
              <li>✓ Stock sube inmediatamente</li>
              <li>✓ Precios activados en web</li>
              <li>✓ Tienes el Serial Number ya</li>
            </ul>
          </button>
        </div>
      </div>
    );
  }

  // PASO 2: Llenar Detalles
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <button
        onClick={() => {
          setStep('origin');
          setOrigin(null);
        }}
        className="mb-6 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
      >
        ← Volver a seleccionar origen
      </button>

      <h2 className="text-2xl font-bold mb-2 text-gray-900">
        {origin === 'INTERNATIONAL'
          ? '✈️ Ingreso de Compra Internacional'
          : '🏪 Ingreso de Compra Local'}
      </h2>
      <p className="text-gray-600 mb-6">
        {origin === 'INTERNATIONAL'
          ? 'Llena la información del producto que compraste en el exterior'
          : 'Llena la información y escanea el Serial Number'}
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* FICHA TÉCNICA */}
        <div className="border-l-4 border-gray-300 pl-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Ficha Técnica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="ej: Laptop Dell Latitude 5420"
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="ej: Dell"
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="ej: Latitude 5420"
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              placeholder={origin === 'INTERNATIONAL' ? 'ej: eBay Seller / Amazon.com' : 'ej: Distribuidor XYZ'}
              required
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            name="specs"
            value={formData.specs}
            onChange={handleChange}
            placeholder="ej: i5-11400H, 16GB RAM, 512GB SSD, Windows 11"
            className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>

        {/* SECCIÓN INTERNACIONAL */}
        {origin === 'INTERNATIONAL' && (
          <div className="border-l-4 border-blue-400 pl-4 bg-blue-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">💰 Información de Compra Internacional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Costo FOB (lo que pagaste en eBay) *
                </label>
                <input
                  type="number"
                  name="costFob"
                  value={formData.costFob}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="ej: 300.00"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">
                  Precio Estimado para la Web *
                </label>
                <input
                  type="number"
                  name="estimatedPrice"
                  value={formData.estimatedPrice}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="ej: 450.00"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
              <p className="font-semibold mb-1">📌 Próximos pasos:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>El producto entra como <span className="font-semibold">EN TRÁNSITO</span></li>
                <li>Aparecerá en la web diciendo "Llega pronto"</li>
                <li>Cuando llegue el paquete, ve a "Tablero de Tránsito"</li>
                <li>Click en "Recibir Mercadería" y agrega aduanas/flete</li>
                <li>Escanea el Serial Number y listo!</li>
              </ol>
            </div>
          </div>
        )}

        {/* SECCIÓN LOCAL */}
        {origin === 'LOCAL' && (
          <div className="border-l-4 border-green-400 pl-4 bg-green-50 p-4 rounded">
            <h3 className="text-lg font-semibold text-green-900 mb-4">💰 Información de Compra Local</h3>
            
            {/* Serial Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-green-900 mb-1">
                Serial Number (escanea el producto) *
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
                placeholder="ej: SN123456789"
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <p className="text-xs text-green-700 mt-1">
                💡 Usa un scanner de código de barras o QR para mayor precisión
              </p>
            </div>

            {/* Costos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Costo de Factura *
                </label>
                <input
                  type="number"
                  name="costInvoice"
                  value={formData.costInvoice}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="ej: 450.00"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Gastos Extras (envío, etc)
                </label>
                <input
                  type="number"
                  name="extraCosts"
                  value={formData.extraCosts}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="ej: 5.00 (Servientrega)"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Precio B2B *
                </label>
                <input
                  type="number"
                  name="priceB2B"
                  value={formData.priceB2B}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="ej: 550.00"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-900 mb-1">
                  Precio PVP (Público) *
                </label>
                <input
                  type="number"
                  name="pricePVP"
                  value={formData.pricePVP}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  placeholder="ej: 699.00"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-100 rounded text-sm text-green-800">
              <p className="font-semibold mb-1">✅ Resultado inmediato:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Producto entra como <span className="font-semibold">DISPONIBLE</span></li>
                <li>Stock aparece en la web</li>
                <li>Precios B2B y PVP se activan</li>
                <li>Código único asignado automáticamente</li>
              </ul>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => {
              setStep('origin');
              setOrigin(null);
            }}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-md transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition"
          >
            {loading ? 'Guardando...' : '✓ Ingresar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
