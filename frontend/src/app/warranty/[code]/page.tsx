'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { PublicWarrantyDTO } from '@/types';

export default function WarrantyCertificatePage() {
  const params = useParams();
  const warrantyCode = params.code as string;
  const [data, setData] = useState<PublicWarrantyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWarrantyDetails = async () => {
      try {
        const response = await apiClient.get(`/warranty/public/${warrantyCode}`);
        setData(response.data);
      } catch (err) {
        setError('No se pudo cargar el certificado de garantia');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (warrantyCode) {
      loadWarrantyDetails();
    }
  }, [warrantyCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Certificado no encontrado'}</p>
          <a href="/" className="text-blue-600 hover:underline">Volver al inicio</a>
        </div>
      </div>
    );
  }

  const emissionDate = data.saleDate || data.warrantyStartDate || new Date().toISOString();
  const emissionDateText = new Date(emissionDate).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const warrantyDurationText = {
    '1_MES': '1 mes',
    '6_MESES': '6 meses',
    '12_MESES': '12 meses',
    'SIN_GARANTIA': 'Sin garantia',
  }[data.warrantyType] || data.warrantyType;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex gap-2 justify-end print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Imprimir certificado
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Atras
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg print:shadow-none print:rounded-none overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CERTIFICADO DE GARANTIA - FiXME</h1>
              <p className="text-gray-600 mt-2">Fecha de Emision: {emissionDateText}</p>
              <p className="text-gray-600 mt-1">Ubicacion: Sector Quicentro Sur, Calle Borbon oe2-23, Quito</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900">1. Informacion del Equipo</h2>
              <div className="mt-3 space-y-2">
                <p><strong>Producto:</strong> {data.productName} (Modelo: {data.model || 'N/D'} - Serie: {data.serialNumber || data.internalCode || 'N/D'})</p>
                <p><strong>Estado:</strong> Seminuevo / Reacondicionado</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900">2. Términos de la Garantía</h2>
              <div className="mt-3 space-y-3">
                <p><strong>Vigencia:</strong> {warrantyDurationText} a partir de la fecha de entrega.</p>
                <p><strong>Cobertura:</strong> Problemas técnicos relacionados con el funcionamiento interno del hardware (Placa base y procesador).</p>
                <p><strong>Exclusiones (No cubierto):</strong> Teclado, Pantalla y Batería, ya que son componentes sujetos a desgaste físico y manipulación directa por el usuario.</p>
                <p><strong>Daños:</strong> Daños por golpes, humedad, variaciones de voltaje o apertura del equipo por personal ajeno.</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900">3. Política de Venta</h2>
              <div className="mt-3">
                <p><strong>Cambios o Devoluciones:</strong> Bajo nuestra política comercial, no se aceptan cambios ni devoluciones de dinero una vez concretada la compra y retirado el producto del local.</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 text-center">
              <p className="font-semibold text-gray-900">Atentamente,</p>
              <p className="font-bold text-gray-900 mt-2">FiXME</p>
              <p className="text-gray-600">Tecnologia de Confianza</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-600 text-sm print:hidden">
          <p>Guarde o imprima este certificado. Lo necesitara en caso de reclamacion.</p>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
