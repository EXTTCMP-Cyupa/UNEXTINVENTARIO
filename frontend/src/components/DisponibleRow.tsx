'use client';

interface DisponibleRowProps {
  id: number;
  productName: string;
  internalCode: string;
  pricePVP?: number | null;
  priceB2B?: number | null;
  daysInStock: number;
  isExpanded: boolean;
  onExpand: (id: number) => void;
}

export default function DisponibleRow({
  id,
  productName,
  internalCode,
  pricePVP,
  priceB2B,
  daysInStock,
  isExpanded,
  onExpand,
}: DisponibleRowProps) {
  const safePricePVP = pricePVP ?? 0;
  const safePriceB2B = priceB2B ?? 0;

  return (
    <div
      className={`
        border-b border-gray-200 hover:bg-gray-50 transition-colors
        grid grid-cols-12 items-center gap-4 px-5 py-3 h-20
        cursor-pointer group
      `}
      onClick={() => onExpand(id)}
    >
      {/* Producto */}
      <div className="col-span-3 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{productName}</p>
        <p className="text-xs text-gray-600 font-mono truncate">{internalCode}</p>
      </div>

      {/* Precio PVP */}
      <div className="col-span-2">
        <p className="text-sm font-bold text-green-600">${safePricePVP.toFixed(2)}</p>
        <p className="text-xs text-gray-500">PVP</p>
      </div>

      {/* Precio B2B */}
      <div className="col-span-2">
        <p className="text-sm font-bold text-blue-600">${safePriceB2B.toFixed(2)}</p>
        <p className="text-xs text-gray-500">B2B</p>
      </div>

      {/* Días */}
      <div className="col-span-1">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-700 whitespace-nowrap">
          {daysInStock}d
        </span>
      </div>

      {/* Acciones */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand(id);
          }}
          className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          Vender
        </button>
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-transform duration-300
            ${isExpanded ? 'bg-teal-100 text-teal-600 rotate-180' : 'text-gray-400 group-hover:text-gray-600'}
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
