'use client';

import { useState } from 'react';

interface TransitRowProps {
  id: number;
  productName: string;
  internalCode: string;
  supplier: string;
  status: string;
  costFob?: number | null;
  priceB2B?: number | null;
  pricePVP?: number | null;
  daysInTransit: number;
  isExpanded: boolean;
  onExpand: (id: number) => void;
  onReceive: (id: number) => void;
  onUpdateLogistics: (id: number) => void;
}

export default function TransitRow({
  id,
  productName,
  internalCode,
  supplier,
  status,
  costFob,
  priceB2B,
  pricePVP,
  daysInTransit,
  isExpanded,
  onExpand,
  onReceive,
  onUpdateLogistics,
}: TransitRowProps) {
  const isInTransit = status === 'EN_TRANSITO';
  const safeCostFob = costFob ?? 0;
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

      {/* Proveedor */}
      <div className="col-span-2 min-w-0">
        <p className="text-sm text-gray-700 truncate">{supplier}</p>
      </div>

      {/* Costo FOB */}
      <div className="col-span-2">
        <p className="text-sm font-bold text-blue-600">${safeCostFob.toFixed(2)}</p>
        <p className="text-xs text-gray-500">FOB</p>
      </div>

      {/* Precio B2B */}
      <div className="col-span-2">
        <p className="text-sm font-bold text-green-600">${safePriceB2B.toFixed(2)}</p>
        <p className="text-xs text-gray-500">B2B</p>
      </div>

      {/* Estado / Días */}
      <div className="col-span-1">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 whitespace-nowrap">
          {daysInTransit}d
        </span>
        {!isInTransit && (
          <p className="mt-1 text-[10px] font-semibold text-blue-700">PREPARACION</p>
        )}
      </div>

      {/* Acciones */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        {isInTransit ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateLogistics(id);
              }}
              className="px-2 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors whitespace-nowrap"
              title="Actualizar sub-estado de tránsito"
            >
              ✏️ Sub-Estado
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReceive(id);
              }}
              className="px-2 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
              title="Registrar llegada al local"
            >
              📦 Recibido
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand(id);
            }}
            className="px-2 py-1.5 text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors whitespace-nowrap"
            title="Enviar a tránsito"
          >
            🚚 Enviar
          </button>
        )}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-transform duration-300
            ${isExpanded ? 'bg-blue-100 text-blue-600 rotate-180' : 'text-gray-400 group-hover:text-gray-600'}
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
