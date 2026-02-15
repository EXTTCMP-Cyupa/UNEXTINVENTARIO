'use client';

import DisponibleList from '@/components/DisponibleList';

export default function DisponibleManagementBoard() {
  return (
    <div className="bg-gray-50 min-h-full -m-6 p-6">
      <div className="max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">✅ Administración de Productos Disponibles</h2>
          <p className="text-gray-600">
            Productos listos para venta: visualiza inventario disponible y completa la transacción final
          </p>
        </div>

        <DisponibleList />
      </div>
    </div>
  );
}
