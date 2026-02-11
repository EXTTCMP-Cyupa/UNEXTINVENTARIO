'use client';

import Header from '@/components/Header';
import ImportForm from '@/components/ImportForm';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ImportsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <div>Acceso denegado. Solo administradores pueden acceder.</div>;
  }

  return (
    <>
      <Header />
      <ImportForm />
    </>
  );
}
