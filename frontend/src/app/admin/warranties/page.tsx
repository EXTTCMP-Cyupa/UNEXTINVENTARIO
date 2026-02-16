'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import { warrantyService } from '@/services/api';
import { AdminWarrantyRecord } from '@/types';
import { useAuthStore } from '@/store/authStore';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const statusVariant = (status?: string) => {
  switch (status) {
    case 'ACTIVA':
      return 'success';
    case 'PENDIENTE':
      return 'warning';
    case 'VENCIDA':
      return 'danger';
    case 'CANCELADA':
      return 'default';
    default:
      return 'info';
  }
};

export default function AdminWarrantiesPage() {
  const router = useRouter();
  const { user, initAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<AdminWarrantyRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

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
      fetchWarranties();
    }
  }, [mounted, user]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const data = await warrantyService.getAdminWarranties();
      setWarranties(data);
    } catch (error) {
      console.error('Error al cargar garantias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return warranties.filter((w) => {
      const matchesSearch =
        !term ||
        w.internalCode?.toLowerCase().includes(term) ||
        w.serialNumber?.toLowerCase().includes(term) ||
        w.productName?.toLowerCase().includes(term) ||
        w.customerName?.toLowerCase().includes(term) ||
        w.warrantyCode?.toLowerCase().includes(term);

      const matchesStatus = statusFilter === 'TODOS' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warranties, searchTerm, statusFilter]);

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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔒 Garantias</h1>
          <p className="text-gray-600 mt-1">Listado completo de garantias de la empresa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Total Garantias</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">{warranties.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Activas</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {warranties.filter((w) => w.status === 'ACTIVA').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-700 mt-2">
                {warranties.filter((w) => w.status === 'PENDIENTE').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Buscar por serial, codigo, cliente o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVA">ACTIVA</option>
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="VENCIDA">VENCIDA</option>
                <option value="CANCELADA">CANCELADA</option>
              </select>
              <button
                onClick={fetchWarranties}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recargar
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garantias ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="mt-3 text-gray-600">Cargando garantias...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-3 pr-3">Producto</th>
                      <th className="py-3 pr-3">Cliente</th>
                      <th className="py-3 pr-3">Garantia</th>
                      <th className="py-3 pr-3">Fechas</th>
                      <th className="py-3 pr-3">Estado</th>
                      <th className="py-3">Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-3">
                          <div className="font-semibold text-gray-900">{w.productName || '-'}</div>
                          <div className="text-xs text-gray-500">
                            {w.internalCode || '-'} · {w.serialNumber || '-'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {w.brand || '-'} {w.model || ''}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="font-medium text-gray-900">{w.customerName || '-'}</div>
                          <div className="text-xs text-gray-500">{w.customerEmail || '-'}</div>
                          <div className="text-xs text-gray-400">{w.customerPhone || '-'}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="text-gray-900">{w.warrantyType || '-'}</div>
                          <div className="text-xs text-gray-500">Venta: {w.saleType || '-'}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <div className="text-xs text-gray-500">Inicio: {formatDate(w.warrantyStartDate)}</div>
                          <div className="text-xs text-gray-500">Fin: {formatDate(w.warrantyEndDate)}</div>
                          <div className="text-xs text-gray-400">Venta: {formatDate(w.startDate)}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <Badge variant={statusVariant(w.status)} size="sm">
                            {w.status || 'SIN ESTADO'}
                          </Badge>
                        </td>
                        <td className="py-3">
                          {w.warrantyCode ? (
                            <div className="space-y-1">
                              <a
                                href={`/warranty/${w.warrantyCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex text-xs text-blue-600 hover:underline"
                              >
                                /warranty/{w.warrantyCode}
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  const link = `${window.location.origin}/warranty/${w.warrantyCode}`;
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(link);
                                  }
                                }}
                                className="block text-xs text-gray-600 hover:text-gray-900"
                              >
                                Copiar link
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
