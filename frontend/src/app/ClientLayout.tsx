'use client';

import { CartProvider } from '@/context/CartContext';
import { PendingOrdersProvider } from '@/context/PendingOrdersContext';
import CartSidebar from '@/components/CartSidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <PendingOrdersProvider>
        {children}
        <CartSidebar />
      </PendingOrdersProvider>
    </CartProvider>
  );
}
