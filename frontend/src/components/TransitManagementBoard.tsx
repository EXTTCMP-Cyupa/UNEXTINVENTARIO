'use client';

import TransitList from '@/components/TransitList';

export default function TransitManagementBoard() {
  return (
    <div className="bg-gray-50 min-h-full -m-6 p-6">
      <div className="max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">✈️ Administración de Tránsito</h2>
          <p className="text-gray-600">
            Panel para gestionar productos en tránsito: seguimiento logístico, ventas y reservas
          </p>
        </div>

        <TransitList />
      </div>
    </div>
  );
}