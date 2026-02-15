'use client';

import PreparationList from '@/components/PreparationList';

export default function PreparationManagementBoard() {
  return (
    <div className="bg-gray-50 min-h-full -m-6 p-6">
      <div className="max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📋 Administración de Preparación</h2>
          <p className="text-gray-600">
            Panel para preparar envíos: ingresa costos estimados, precios y datos de envío
          </p>
        </div>

        <PreparationList />
      </div>
    </div>
  );
}
