'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent } from '@/components/ui';
import InventoryIngresoForm from '@/components/InventoryIngresoForm';
import InventoryList from '@/components/InventoryList';
import PreparationManagementBoard from '@/components/PreparationManagementBoard';
import TransitManagementBoard from '@/components/TransitManagementBoard';
import StockLocalManagementBoard from '@/components/StockLocalManagementBoard';
import DisponibleManagementBoard from '@/components/DisponibleManagementBoard';
import { useAuthStore } from '@/store/authStore';

type TabType = 'ingreso' | 'comprado' | 'preparacion' | 'transito' | 'stock_local' | 'disponible' | 'vendido';

export default function AdminInventoryPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('comprado');

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (mounted && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [mounted, user, router]);

  if (!mounted || !user || user.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="p-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-yellow-800">
                <p>Acceso denegado. Solo administradores pueden acceder a esta página.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const tabs: { id: TabType; label: string; icon: string; description: string }[] = [
    { id: 'ingreso', label: 'Nuevo Ingreso', icon: '📦', description: 'Registrar compra nueva (Internacional o Nacional)' },
    { id: 'comprado', label: 'Comprado', icon: '🛒', description: 'Productos COMPRADOS esperando preparación' },
    { id: 'preparacion', label: 'Preparación', icon: '📋', description: 'Preparar envío: ingresar costos y precios' },
    { id: 'transito', label: 'En Tránsito', icon: '✈️', description: 'En envío internacional - seguimiento logístico' },
    { id: 'stock_local', label: 'Stock Local', icon: '📦', description: 'Recibidos en local - confirmar y listar para venta' },
    { id: 'disponible', label: 'Disponible', icon: '✅', description: 'Productos listos para venta - cierra la venta' },
    { id: 'vendido', label: 'Vendido', icon: '💰', description: 'Transacciones completadas' },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header con flujo visual */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestión de Inventario</h1>
          <p className="text-gray-600 mb-6">
            Flujo completo de importación: Comprado → Preparación → Tránsito → Stock Local → Disponible → Vendido
          </p>

          {/* Visual Flow - 6 Pasos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-center gap-4 overflow-x-auto pb-2 flex-wrap">
              {/* Comprado */}
              <div className="flex flex-col items-center gap-2 min-w-max">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${activeTab === 'comprado' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                  1
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">Comprado</p>
              </div>

              <div className="h-1 w-8 bg-gray-300"></div>

              {/* Preparación */}
              <div className="flex flex-col items-center gap-2 min-w-max">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${activeTab === 'preparacion' ? 'bg-yellow-600' : 'bg-gray-400'}`}>
                  2
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">Preparación</p>
              </div>

              <div className="h-1 w-8 bg-gray-300"></div>

              {/* Tránsito */}
              <div className="flex flex-col items-center gap-2 min-w-max">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${activeTab === 'transito' ? 'bg-orange-600' : 'bg-gray-400'}`}>
                  3
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">Tránsito</p>
              </div>

              <div className="h-1 w-8 bg-gray-300"></div>

              {/* Stock Local */}
              <div className="flex flex-col items-center gap-2 min-w-max">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${activeTab === 'stock_local' ? 'bg-purple-600' : 'bg-gray-400'}`}>
                  4
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">Local</p>
              </div>

              <div className="h-1 w-8 bg-gray-300"></div>

              {/* Disponible */}
              <div className="flex flex-col items-center gap-2 min-w-max">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${activeTab === 'disponible' ? 'bg-teal-600' : 'bg-gray-400'}`}>
                  5
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">Disponible</p>
              </div>

              <div className="h-1 w-8 bg-gray-300"></div>

              {/* Vendido */}
              <div className="flex flex-col items-center gap-2 min-w-max">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${activeTab === 'vendido' ? 'bg-green-600' : 'bg-gray-400'}`}>
                  6
                </div>
                <p className="text-xs font-medium text-gray-700 text-center">Vendido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 whitespace-nowrap font-medium rounded-lg transition-all duration-200 group
                ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }
              `}
              title={tab.description}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'ingreso' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">📦 Nuevo Ingreso de Mercadería</h2>
                <p className="text-gray-600 mt-2">Registra una compra nueva (Internacional o Nacional)</p>
              </CardHeader>
              <CardContent>
                <InventoryIngresoForm />
              </CardContent>
            </Card>
          )}

          {activeTab === 'comprado' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">🛒 Productos Comprados</h2>
                <p className="text-gray-600 mt-2">Estado: COMPRADO - Esperando preparación de envío</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Próximo paso:</strong> Prepara el envío ingresando costos y precios estimados
                  </p>
                </div>
                <InventoryList initialFilter="COMPRADO" />
              </CardContent>
            </Card>
          )}

          {activeTab === 'preparacion' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">📋 Preparación de Envío</h2>
                <p className="text-gray-600 mt-2">Estado: PREPARACION_ENVIO - Ingresa costos y precios antes de enviar</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>En este estado debes:</strong> Ingresar costos estimados de flete y aduanas, precios de compra, y precios de venta
                  </p>
                </div>
                <PreparationManagementBoard />
              </CardContent>
            </Card>
          )}

          {activeTab === 'transito' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">✈️ Productos en Tránsito</h2>
                <p className="text-gray-600 mt-2">Estado: EN_TRANSITO - Productos en envío internacional</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>En este estado puedes:</strong> Actualizar sub-estados de tránsito (En Aduana, En Camino, Listo Local, Recibido)
                  </p>
                </div>
                <TransitManagementBoard />
              </CardContent>
            </Card>
          )}

          {activeTab === 'stock_local' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">📦 Stock en Local</h2>
                <p className="text-gray-600 mt-2">Estado: STOCK_EN_LOCAL - Productos recibidos internacionalmente, listos para ingresar costos y precios</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>En este estado debes:</strong> Confirmar recepción, ingresar costos de aduana + flete, y definir precios B2B y PVP para venta
                  </p>
                </div>
                <StockLocalManagementBoard />
              </CardContent>
            </Card>
          )}

          {activeTab === 'disponible' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">✅ Productos Disponibles</h2>
                <p className="text-gray-600 mt-2">Estado: DISPONIBLE - Productos listos para venta</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-sm text-teal-800">
                    <strong>En este estado puedes:</strong> Ver productos disponibles para venta y completar la transacción final
                  </p>
                </div>
                <DisponibleManagementBoard />
              </CardContent>
            </Card>
          )}

          {activeTab === 'vendido' && (
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold text-gray-900">💰 Productos Vendidos</h2>
                <p className="text-gray-600 mt-2">Estado: VENDIDO - Transacciones completadas</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Información:</strong> Aquí aparecen todos los productos que han sido vendidos exitosamente
                  </p>
                </div>
                <InventoryList initialFilter="VENDIDO" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Workflow Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">📚 Flujo Completo de Importación (6 Pasos)</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">1</span>
                <div>
                  <p className="font-medium text-gray-900">COMPRADO</p>
                  <p className="text-sm text-gray-600">Productos comprados en eBay/tiendas del exterior, en bodega del importador. Registro inicial con datos del proveedor.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-medium text-sm">2</span>
                <div>
                  <p className="font-medium text-gray-900">PREPARACION_ENVIO</p>
                  <p className="text-sm text-gray-600">
                    Preparación del envío internacional. Se ingresan:<br/>
                    • Costos estimados (flete, aduanas)<br/>
                    • Precio referencial de compra<br/>
                    • Precio inicial de venta<br/>
                    • Número de seguimiento (auto-transita a EN_TRANSITO)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-medium text-sm">3</span>
                <div>
                  <p className="font-medium text-gray-900">EN_TRANSITO</p>
                  <p className="text-sm text-gray-600">
                    Producto en envío internacional. Sub-estados de seguimiento:<br/>
                    • ENVIADO_AL_PAIS: Salió de origen<br/>
                    • EN_ADUANA: Pasando trámites aduanales<br/>
                    • EN_CAMINO_AL_LOCAL: En ruta final hacia el local
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-medium text-sm">4</span>
                <div>
                  <p className="font-medium text-gray-900">STOCK_LOCAL</p>
                  <p className="text-sm text-gray-600">
                    Producto recibido en el local. Se confirman:<br/>
                    • Número de serie / SKU<br/>
                    • Costos finales (aduanas, flete real)<br/>
                    • Precios finales (B2B y PVP)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-medium text-sm">5</span>
                <div>
                  <p className="font-medium text-gray-900">DISPONIBLE</p>
                  <p className="text-sm text-gray-600">Producto listo para venta. Se marca como disponible y se espera para registrar la transacción final con cliente.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-medium text-sm">6</span>
                <div>
                  <p className="font-medium text-gray-900">VENDIDO</p>
                  <p className="text-sm text-gray-600">Transacción completada. Se calcula automáticamente la utilidad (margen de ganancia). Historial de venta grabado.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
