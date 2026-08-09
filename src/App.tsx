import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category, Product } from '@/lib/types';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useRouter } from '@/lib/router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { HomePage } from '@/pages/HomePage';
import { ShopPage } from '@/pages/ShopPage';
import { ProductPage } from '@/pages/ProductPage';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

function StoreFront() {
  const { route, navigate } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [catRes, prodRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').eq('active', true).order('sort_order'),
    ]);
    setCategories(catRes.data ?? []);
    setProducts(prodRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const headerCategories = categories.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={headerCategories} />

      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-cream-300 border-t-rose-500" />
          </div>
        ) : (
          <>
            {route.name === 'home' && <HomePage categories={categories} products={products} />}
            {route.name === 'shop' && (
              <ShopPage categories={categories} products={products} activeCategory={route.category} />
            )}
            {route.name === 'product' && (() => {
              const product = products.find((p) => p.id === route.id);
              if (!product) {
                return (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <p className="font-display text-2xl font-700 text-rose-900">Product not found</p>
                    <button onClick={() => navigate('/shop')} className="btn-primary mt-4">Back to Shop</button>
                  </div>
                );
              }
              const category = categories.find((c) => c.id === product.category_id);
              const related = products
                .filter((p) => p.category_id === product.category_id && p.id !== product.id)
                .slice(0, 4);
              return <ProductPage product={product} category={category} relatedProducts={related} />;
            })()}
          </>
        )}
      </main>

      <Footer categories={headerCategories} />

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}

function AdminRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cream-300 border-t-rose-500" />
      </div>
    );
  }

  return session ? <AdminDashboard /> : <AdminLogin />;
}

function App() {
  const { route } = useRouter();

  return (
    <AuthProvider>
      <CartProvider>
        {route.name === 'admin' ? <AdminRoute /> : <StoreFront />}
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
