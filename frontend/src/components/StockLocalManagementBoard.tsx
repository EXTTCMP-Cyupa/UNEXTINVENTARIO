'use client';

import StockLocalList from '@/components/StockLocalList';

export default function StockLocalManagementBoard() {
  return (
    <div className="bg-gray-50 min-h-full -m-6 p-6">
      <div className="max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📦 Administración de Stock en Local</h2>
          <p className="text-gray-600">
            Confirmar recepción de productos internacionales: ingresar costos de aduana, flete y precios finales
          </p>
        </div>

        <StockLocalList />
      </div>
    </div>
  );
}
