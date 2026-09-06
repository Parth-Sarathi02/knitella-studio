'use client';

import { useState, type ReactNode } from 'react';
import { CartProvider } from '@/lib/cart-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';

interface StoreShellProps {
  categories: { slug: string; name: string }[];
  children: ReactNode;
}

export function StoreShell({ categories, children }: StoreShellProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
        <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
        <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      </div>
    </CartProvider>
  );
}
