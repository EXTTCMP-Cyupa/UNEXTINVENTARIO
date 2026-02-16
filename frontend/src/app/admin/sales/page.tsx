'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface AvailableProduct {
  id: number;
  internalCode: string;
  productName: string;
  brand: string;
  model?: string;
  specs: string;
  serialNumber?: string;
  costFob: number;
  costShipping: number;
  costCustoms: number;
  priceB2B: number;
  pricePVP: number;
  productOwner?: string;
  supplier: string;
  daysInStock: number;
  statusAtSale: string; // EN_TRANSITO o DISPONIBLE
}

export default function SalesPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<AvailableProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AvailableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<AvailableProduct | null>(null);
  const [showSaleForm, setShowSaleForm] = useState(false);

  // Form state
  const [saleForm, setSaleForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    salePrice: '',
    paymentMethod: 'EFECTIVO',
    warrantyType: '6_MESES',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (mounted && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  useEffect(() => {
    if (mounted && user?.role === 'ADMIN') {
      fetchAvailableProducts();
    }
  }, [mounted, user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.productName.toLowerCase().includes(term) ||
            p.internalCode.toLowerCase().includes(term) ||
            (p.serialNumber && p.serialNumber.toLowerCase().includes(term)) ||
            p.brand.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, products]);

  const fetchAvailableProducts = async () => {
    try {
      setLoading(true);
      // Fetch both DISPONIBLE and EN_TRANSITO products
      const [disponibleRes, transitoRes] = await Promise.all([
        api.get('/products/inventory/disponible'),
        api.get('/products/inventory/transito'),
      ]);
      
      const disponible = (disponibleRes.data || []).map((p: any) => ({
        ...p,
        statusAtSale: 'DISPONIBLE',
      }));
      
      const transito = (transitoRes.data || []).map((p: any) => ({
        ...p,
        statusAtSale: 'EN_TRANSITO',
      }));
      
      const allProducts = [...disponible, ...transito];
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (err: any) {
      console.error('Error fetching available products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: AvailableProduct) => {
    setSelectedProduct(product);
    setSaleForm({
      customerName: product.productOwner || '',
      customerEmail: '',
      customerPhone: '',
      salePrice: product.pricePVP.toString(),
      paymentMethod: 'EFECTIVO',
      warrantyType: '6_MESES',
      notes: '',
    });
    setShowSaleForm(true);
    setError(null);
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitting(true);
    setError(null);

    try {
      const salePrice = parseFloat(saleForm.salePrice);

      if (!saleForm.customerName.trim()) {
        throw new Error('El nombre del cliente es requerido');
      }

      if (salePrice <= 0) {
        throw new Error('El precio de venta debe ser mayor a 0');
      }

      const isAnticipated = selectedProduct.statusAtSale === 'EN_TRANSITO';

      await api.post('/products/inventory/register-sale', {
        inventoryItemId: selectedProduct.id,
        customerName: saleForm.customerName.trim(),
        customerEmail: saleForm.customerEmail.trim() || null,
        customerPhone: saleForm.customerPhone.trim() || null,
        salePrice,
        paymentMethod: saleForm.paymentMethod,
        warrantyType: saleForm.warrantyType,
        notes: saleForm.notes.trim() || null,
      });

      const message = isAnticipated
        ? '🚀 ¡Venta anticipada registrada! El producto se entregará cuando llegue al local.'
        : '💰 ¡Venta registrada exitosamente!';
      alert(message);
      setShowSaleForm(false);
      setSelectedProduct(null);
      fetchAvailableProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al registrar venta');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateMargin = () => {
    if (!selectedProduct) return { margin: 0, marginPercent: 0 };
    const costFob = selectedProduct.costFob ?? 0;
    const costShipping = selectedProduct.costShipping ?? 0;
    const costCustoms = selectedProduct.costCustoms ?? 0;
    const landedCost = costFob + costShipping + costCustoms;
    const salePrice = parseFloat(saleForm.salePrice) || 0;
    const margin = salePrice - landedCost;
    const marginPercent = landedCost > 0 ? (margin / landedCost) * 100 : 0;
    return { margin, marginPercent };
  };

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-yellow-800">
                <p>Cargando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { margin, marginPercent } = calculateMargin();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Ventas</h1>
          <p className="text-gray-600 mt-1">Registra ventas de productos disponibles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Productos Disponibles</p>
              <p className="text-3xl font-bold text-teal-700 mt-2">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Valor Stock (PVP)</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                ${products.reduce((sum, p) => sum + (p.pricePVP ?? 0), 0).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Ganancia Potencial</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                $
                {products
                  .reduce(
                    (sum, p) =>
                      sum + ((p.pricePVP ?? 0) - ((p.costFob ?? 0) + (p.costShipping ?? 0) + (p.costCustoms ?? 0))),
                    0
                  )
                  .toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
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

              {/* Lista */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Cargando productos...</p>
                  </div>
                )}

                {!loading && filteredProducts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </div>
                )}

                {!loading &&
                  filteredProducts.map((product) => {
                    // Valores seguros con defaults
                    const pricePVP = product.pricePVP ?? 0;
                    const priceB2B = product.priceB2B ?? 0;
                    const costFob = product.costFob ?? 0;
                    const costShipping = product.costShipping ?? 0;
                    const costCustoms = product.costCustoms ?? 0;
                    
                    const landedCost = costFob + costShipping + costCustoms;
                    const marginPVP = pricePVP - landedCost;
                    const marginPVPPercent = landedCost > 0 ? (marginPVP / landedCost) * 100 : 0;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedProduct?.id === product.id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{product.productName}</p>
                              {product.statusAtSale === 'EN_TRANSITO' && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                                  🚀 VENTA ANTICIPADA
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                              {product.internalCode}
                              {product.serialNumber && ` | S/N: ${product.serialNumber}`}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {product.brand} {product.model && `• ${product.model}`}
                            </p>
                            {product.statusAtSale === 'EN_TRANSITO' && (
                              <p className="text-xs text-amber-600 mt-1 font-medium">
                                ⏳ En tránsito - Se entregará al llegar
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-teal-700">
                              ${pricePVP.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              B2B: ${priceB2B.toFixed(2)}
                            </p>
                            <p
                              className={`text-xs font-semibold ${
                                marginPVPPercent >= 20
                                  ? 'text-green-600'
                                  : marginPVPPercent >= 10
                                  ? 'text-blue-600'
                                  : 'text-yellow-600'
                              }`}
                            >
                              +{marginPVPPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Venta */}
          <Card>
            <CardHeader>
              <CardTitle>Registrar Venta</CardTitle>
            </CardHeader>
            <CardContent>
              {!showSaleForm ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">👈</div>
                  <p>Selecciona un producto de la lista para registrar una venta</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitSale} className="space-y-4">
                  {/* Info del Producto */}
                  {selectedProduct && (
                    <div className={`border rounded-lg p-4 mb-4 ${
                      selectedProduct.statusAtSale === 'EN_TRANSITO'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-teal-50 border-teal-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{selectedProduct.productName}</p>
                        {selectedProduct.statusAtSale === 'EN_TRANSITO' && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                            🚀 VENTA ANTICIPADA
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedProduct.brand} • {selectedProduct.internalCode}
                      </p>
                      {selectedProduct.serialNumber && (
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          S/N: {selectedProduct.serialNumber}
                        </p>
                      )}
                      {selectedProduct.statusAtSale === 'EN_TRANSITO' && (
                        <p className="text-xs text-amber-700 mt-2 font-medium">
                          ⚠️ Este producto está en tránsito. La garantía se activará cuando llegue al local.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <p className="text-xs text-gray-600">Precio B2B</p>
                          <p className="font-semibold text-blue-700">
                            ${selectedProduct.priceB2B.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Precio PVP (sugerido)</p>
                          <p className="font-semibold text-green-700">
                            ${selectedProduct.pricePVP.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cliente */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cliente <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={saleForm.customerName}
                      onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del cliente"
                    />
                  </div>

                  {/* Email (opcional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email (opcional)
                    </label>
                    <input
                      type="email"
                      value={saleForm.customerEmail}
                      onChange={(e) => setSaleForm({ ...saleForm, customerEmail: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email@ejemplo.com"
                    />
                  </div>

                  {/* Teléfono (opcional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono (opcional)
                    </label>
                    <input
                      type="tel"
                      value={saleForm.customerPhone}
                      onChange={(e) => setSaleForm({ ...saleForm, customerPhone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+593 99 123 4567"
                    />
                  </div>

                  {/* Precio de Venta */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Precio de Venta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={saleForm.salePrice}
                      onChange={(e) => setSaleForm({ ...saleForm, salePrice: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    {saleForm.salePrice && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ganancia:</span>
                          <span
                            className={`font-semibold ${
                              margin >= 0 ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            ${margin.toFixed(2)} ({marginPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Método de Pago */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Método de Pago
                    </label>
                    <select
                      value={saleForm.paymentMethod}
                      onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EFECTIVO">💵 Efectivo</option>
                      <option value="TRANSFERENCIA">🏦 Transferencia</option>
                      <option value="TARJETA">💳 Tarjeta</option>
                      <option value="CREDITO">📋 Crédito</option>
                    </select>
                  </div>

                  {/* Tipo de Garantía */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Garantía
                    </label>
                    <select
                      value={saleForm.warrantyType}
                      onChange={(e) => setSaleForm({ ...saleForm, warrantyType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="SIN_GARANTIA">❌ Sin Garantía</option>
                      <option value="1_MES">✅ 1 Mes</option>
                      <option value="6_MESES">✅ 6 Meses</option>
                      <option value="12_MESES">✅ 12 Meses (1 Año)</option>
                    </select>
                    {selectedProduct?.statusAtSale === 'EN_TRANSITO' && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⏳ La garantía iniciará cuando el producto llegue al local
                      </p>
                    )}
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={saleForm.notes}
                      onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Observaciones sobre la venta..."
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaleForm(false);
                        setSelectedProduct(null);
                        setError(null);
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 transition-colors font-semibold"
                    >
                      {submitting ? 'Registrando...' : '💰 Registrar Venta'}
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
