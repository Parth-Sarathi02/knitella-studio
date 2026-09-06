'use client';

import { ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';

interface HeaderProps {
  categories: { slug: string; name: string }[];
}

export function Header({ categories }: HeaderProps) {
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-cream-200 bg-cream-50/90 shadow-soft backdrop-blur-md'
          : 'border-transparent bg-cream-50/60 backdrop-blur-sm'
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-4'
        }`}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <motion.img
            src="https://xcc9khk9a6.ufs.sh/f/rsLPUfmJafUIrOFabkmJafUItvkPnzMmFOR5XYTdh3pK20oc"
            alt="Knitella Studio"
            className="h-11 w-11 object-contain"
            whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
            transition={{ duration: 0.5 }}
          />
          <div className="leading-tight text-left">
            <div className="font-display text-lg font-semibold text-rose-900">Knitella</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-500">Studio</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/shop" label="All Products" />
          {categories.map((c) => (
            <NavLink key={c.slug} href={`/shop/${c.slug}`} label={c.name} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={openCart}
            whileTap={{ scale: 0.9 }}
            whileHover={{ y: -2 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-700 shadow-soft transition-colors hover:bg-rose-50"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-700 shadow-soft md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-cream-200 bg-cream-50 md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-3">
              <Link href="/shop" onClick={() => setMobileOpen(false)} className="btn-ghost justify-start">
                All Products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop/${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="btn-ghost justify-start"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="group relative px-4 py-2 text-sm font-medium text-rose-700 transition-colors hover:text-rose-900">
      {label}
      <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-rose-400 transition-transform duration-300 group-hover:scale-x-100" />
    </Link>
  );
}
