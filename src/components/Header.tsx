import { ShoppingBag, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { navigate } from '@/lib/router';

interface HeaderProps {
  categories: { slug: string; name: string }[];
}

export function Header({ categories }: HeaderProps) {
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cream-200 bg-cream-50/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button onClick={() => go('/')} className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-soft transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="text-left leading-none">
            <span className="block font-display text-lg font-600 text-rose-900">Knitella</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-rose-400">Studio</span>
          </div>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <button onClick={() => go('/shop')} className="btn-ghost">All Products</button>
          {categories.map((c) => (
            <button key={c.slug} onClick={() => go(`/shop/${c.slug}`)} className="btn-ghost">
              {c.name}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-700 shadow-soft transition-all hover:shadow-card hover:bg-rose-50"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-700 shadow-soft md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-cream-200 bg-cream-50 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1 px-4 py-3">
            <button onClick={() => go('/shop')} className="btn-ghost justify-start">All Products</button>
            {categories.map((c) => (
              <button key={c.slug} onClick={() => go(`/shop/${c.slug}`)} className="btn-ghost justify-start">
                {c.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
