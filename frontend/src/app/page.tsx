'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">FIXME Ecosystem</h1>
          <p className="text-xl text-gray-300 mb-8">ERP + Marketplace para Tecnología</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-primary rounded-lg p-6 hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold text-accent mb-2">Catálogo</h2>
              <p className="text-gray-300 mb-4">
                Explora nuestro catálogo de laptops, monitores y repuestos
              </p>
              <Link href="/catalog" className="text-secondary hover:underline">
                Ver Catálogo →
              </Link>
            </div>

            <div className="bg-primary rounded-lg p-6 hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold text-accent mb-2">Importaciones</h2>
              <p className="text-gray-300 mb-4">
                Gestiona el ingreso de mercadería con cálculo automático de costos
              </p>
              <Link href="/imports" className="text-secondary hover:underline">
                Ir a Importaciones →
              </Link>
            </div>

            <div className="bg-primary rounded-lg p-6 hover:shadow-lg transition">
              <h2 className="text-2xl font-semibold text-accent mb-2">Garantía</h2>
              <p className="text-gray-300 mb-4">
                Consulta el historial completo de cualquier producto
              </p>
              <Link href="/warranty" className="text-secondary hover:underline">
                Buscar Garantía →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
