'use client';

import { useState } from 'react';

interface StockLocalRowProps {
  id: number;
  productName: string;
  internalCode: string;
  supplier: string;
  costFob?: number | null;
  daysInTransit: number;
  isExpanded: boolean;
  onExpand: (id: number) => void;
  onConfirmReceipt: () => void;
}

export default function StockLocalRow({
  id,
  productName,
  internalCode,
  supplier,
  costFob,
  daysInTransit,
  isExpanded,
  onExpand,
  onConfirmReceipt,
}: StockLocalRowProps) {
  const costFobSafe = costFob ?? 0;

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
        <p className="text-sm font-bold text-blue-600">${costFobSafe.toFixed(2)}</p>
        <p className="text-xs text-gray-500">FOB</p>
      </div>

      {/* Días */}
      <div className="col-span-1">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 whitespace-nowrap">
          {daysInTransit}d
        </span>
      </div>

      {/* Acciones */}
      <div className="col-span-2 flex items-center justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConfirmReceipt();
          }}
          className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors whitespace-nowrap"
        >
          Confirmar
        </button>
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-transform duration-300
            ${isExpanded ? 'bg-purple-100 text-purple-600 rotate-180' : 'text-gray-400 group-hover:text-gray-600'}
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
