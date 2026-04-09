'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useCart } from '@/context/CartContext';

interface InventoryItem {
  id: number;
  internalCode: string;
  serialNumber: string;
  status: string;
  productName: string;
  category?: string;
  brand: string;
  model: string;
  specs: string;
  imageUrls?: string[];
  priceB2B: number;
  pricePVP: number;
  estimatedPrice: number;
  purchaseType: string;
  createdAt: string;
}

interface CatalogProduct extends InventoryItem {
  displayPrice: number;
  displayCategory: string;
  imageUrl: string;
  rating: number;
  reviews: number;
}

const STOCK_BADGE: Record<string, { label: string; className: string }> = {
  DISPONIBLE: { label: 'Stock disponible', className: 'bg-emerald-500 text-white' },
  STOCK_LOCAL: { label: 'Stock local', className: 'bg-blue-500 text-white' },
  EN_TRANSITO: { label: 'Llega pronto', className: 'bg-amber-500 text-white' },
};

const PRODUCT_IMAGE_BY_KEYWORD: Record<string, string> = {
  laptop: 'https://images.unsplash.com/photo-1593642633279-1796119d5482?auto=format&fit=crop&w=1200&q=80',
  headset: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
  audifono: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
  mouse: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80',
  ssd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80',
  monitor: 'https://images.unsplash.com/photo-1527443224154-c4c0a7e9b4f5?auto=format&fit=crop&w=1200&q=80',
  teclado: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80',
};

export default function CatalogView() {
  const [mounted, setMounted] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { addItem } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        // Fetch available, in transit, and local stock products
        const [availableResponse, transitResponse, stockLocalResponse] = await Promise.all([
          api.get<InventoryItem[]>('/products/inventory/disponible'),
          api.get<InventoryItem[]>('/products/inventory/transito'),
          api.get<InventoryItem[]>('/products/inventory/stock-local'),
        ]);

        const available = availableResponse.data || [];
        const transit = transitResponse.data || [];
        const stockLocal = stockLocalResponse.data || [];
        
        setInventory([...available, ...transit, ...stockLocal].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error cargando catálogo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  const handleAddToCart = (item: InventoryItem) => {
    const price = getPrice(item);
    addItem({
      id: item.id,
      productName: item.productName,
      brand: item.brand,
      model: item.model,
      price,
      inventoryItemId: item.id,
      quantity: 1,
    });

    // Mostrar notificación
    setSuccessMessage(`${item.productName} agregado al carrito`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 mt-4 font-medium">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const getPrice = (item: InventoryItem): number => {
    if (isAuthenticated && user?.role === 'PARTNER') {
      return item.priceB2B || 0;
    }
    return item.status === 'EN_TRANSITO' ? (item.estimatedPrice || 0) : (item.pricePVP || 0);
  };

  const inferCategory = (item: InventoryItem): string => {
    if (item.category && item.category.trim()) return item.category;
    const lookup = `${item.productName} ${item.model} ${item.specs}`.toLowerCase();
    if (lookup.includes('laptop')) return 'Laptops';
    if (lookup.includes('mouse')) return 'Accesorios';
    if (lookup.includes('headset') || lookup.includes('audifono')) return 'Audio';
    if (lookup.includes('ssd')) return 'Componentes';
    return 'Tecnologia';
  };

  const getImageUrl = (item: InventoryItem): string => {
    if (item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0]) {
      return item.imageUrls[0];
    }

    const keySource = `${item.productName} ${item.model} ${item.specs}`.toLowerCase();
    const hit = Object.keys(PRODUCT_IMAGE_BY_KEYWORD).find((key) => keySource.includes(key));
    return hit ? PRODUCT_IMAGE_BY_KEYWORD[hit] : PRODUCT_IMAGE_BY_KEYWORD.laptop;
  };

  const buildProduct = (item: InventoryItem): CatalogProduct => {
    const rating = 4 + ((item.id % 7) / 10);
    const reviews = 18 + ((item.id * 17) % 220);

    return {
      ...item,
      displayPrice: getPrice(item),
      displayCategory: inferCategory(item),
      imageUrl: getImageUrl(item),
      rating: Math.min(5, Number(rating.toFixed(1))),
      reviews,
    };
  };

  const allProducts = inventory.map(buildProduct);

  const categoryOptions = Array.from(new Set(allProducts.map((item) => item.displayCategory))).sort();
  const brandOptions = Array.from(new Set(allProducts.map((item) => item.brand))).sort();

  const toggleFilterValue = (
    value: string,
    current: string[],
    setCurrent: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setCurrent((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const filteredProducts = allProducts.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${item.productName} ${item.brand} ${item.model} ${item.specs}`.toLowerCase().includes(term);
    const matchesPrice = item.displayPrice <= maxPrice;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.displayCategory);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.brand);
    const matchesRating = item.rating >= minRating;
    return matchesSearch && matchesPrice && matchesCategory && matchesBrand && matchesRating;
  });

  const recentProducts = [...allProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-3.5 w-3.5 ${rating >= star ? 'text-amber-400' : 'text-slate-300'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const ProductCard = ({ item, compact = false }: { item: CatalogProduct; compact?: boolean }) => {
    const statusMeta = STOCK_BADGE[item.status] || { label: item.status, className: 'bg-slate-500 text-white' };
    const serialPreview = item.serialNumber ? item.serialNumber.slice(-6) : 'N/A';
    const quickSpecs = item.specs ? item.specs.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3) : [];
    const isAvailable = item.status === 'DISPONIBLE';

    return (
      <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}>{statusMeta.label}</span>
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.brand} | {item.displayCategory}</p>
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{item.productName}</h3>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              {renderStars(item.rating)}
              <span>{item.rating.toFixed(1)} ({item.reviews})</span>
            </div>
            <span>Serial ...{serialPreview}</span>
          </div>

          {quickSpecs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {quickSpecs.map((spec) => (
                <span key={`${item.id}-${spec}`} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                  {spec}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
            <div>
              <p className="text-2xl font-bold text-slate-900">${item.displayPrice.toFixed(2)}</p>
              {item.status !== 'DISPONIBLE' && <p className="text-[11px] font-medium text-amber-600">Precio estimado</p>}
            </div>
            <Link href="/warranty" className="text-xs font-semibold text-blue-700 hover:text-blue-900">
              Ver trazabilidad
            </Link>
          </div>

          <div className={`grid ${compact ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            <button
              onClick={() => handleAddToCart(item)}
              disabled={!isAvailable}
              className="rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500"
            >
              {isAvailable ? 'Anadir al carrito' : 'No disponible'}
            </button>
            {!compact && (
              <Link
                href="/warranty"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Ver detalles
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-[#0b1f4f] via-[#1a2b7a] to-[#3e2f99] p-5 text-white shadow-xl md:p-8">
        <div className="grid gap-4 md:grid-cols-[1.35fr_1fr] md:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Lanzamiento destacado</p>
            <h1 className="text-2xl font-bold leading-tight md:text-4xl">Nuevos audifonos X1 Pro con oferta de lanzamiento</h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100 md:text-base">Catalogo premium con trazabilidad por serial, garantia directa y disponibilidad en tiempo real.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#18295f] hover:bg-blue-50">Ver oferta</button>
              <Link href="/warranty" className="rounded-xl border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20">
                Consultar garantia
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-200">Búsqueda inteligente</p>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por producto, marca, categoria"
              className="mt-2 h-10 w-full rounded-xl border border-white/30 bg-white/95 px-3 text-sm text-slate-800 outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {['Laptops', 'Componentes', 'Ofertas', 'Apple', 'Samsung'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSearch(tag)}
                  className="rounded-lg border border-white/30 bg-white/15 px-2.5 py-1 font-semibold text-white hover:bg-white/25"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recien llegados</h2>
            <p className="text-sm text-slate-500">Nuevos productos agregados en las ultimas cargas.</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 md:hidden"
          >
            {mobileFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {recentProducts.map((item) => (
            <ProductCard key={`recent-${item.id}`} item={item} compact />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className={`space-y-4 ${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-24 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Filtros</h3>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Precio</p>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>$0</span>
                <span className="font-semibold text-slate-700">${maxPrice}</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Categoria</p>
              <div className="space-y-1.5">
                {categoryOptions.map((category) => (
                  <label key={category} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleFilterValue(category, selectedCategories, setSelectedCategories)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Marca</p>
              <div className="max-h-36 space-y-1.5 overflow-auto pr-1">
                {brandOptions.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleFilterValue(brand, selectedBrands, setSelectedBrands)}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-800">Calificacion minima</p>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setMinRating(score)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${minRating === score ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {score === 0 ? 'Todas' : `${score}+`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSearch('');
                setMaxPrice(1000);
                setSelectedCategories([]);
                setSelectedBrands([]);
                setMinRating(0);
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Catalogo principal</h2>
              <p className="text-sm text-slate-500">{filteredProducts.length} productos listados</p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-800">No encontramos productos con esos filtros.</p>
              <p className="mt-1 text-sm text-slate-500">Ajusta criterios de busqueda para ver mas resultados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Notificación de Éxito */}
      {successMessage && (
        <div className="fixed right-6 top-6 z-50 rounded-xl bg-emerald-500 px-6 py-3 text-white shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Sin productos */}
      {inventory.length === 0 && (
        <div className="rounded-2xl bg-slate-50 py-20 text-center">
          <div className="mb-6 text-7xl">📭</div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900">
            No hay productos disponibles
          </h3>
          <p className="mx-auto max-w-md text-gray-600">
            Vuelve pronto. Los productos aparecerán aquí cuando se agreguen al sistema
          </p>
        </div>
      )}
    </div>
  );
}
