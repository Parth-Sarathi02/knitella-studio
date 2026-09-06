'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';

const MotionLink = motion.create(Link);

interface ShopPageProps {
  categories: Category[];
  products: Product[];
  activeCategory?: string;
}

export function ShopPageClient({ categories, products, activeCategory }: ShopPageProps) {
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    const cat = categories.find((c) => c.slug === activeCategory);
    if (!cat) return products;
    return products.filter((p) => p.category_id === cat.id);
  }, [products, categories, activeCategory]);

  const currentCategory = categories.find((c) => c.slug === activeCategory);
  const title = currentCategory ? currentCategory.name : 'All Products';
  const description = currentCategory
    ? currentCategory.description
    : 'Browse our full collection of handmade pipe cleaner creations.';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal className="text-center" key={title}>
        <h1 className="font-display text-4xl font-bold text-rose-900 sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-rose-600/70">{description}</p>
      </Reveal>

      {/* Category pills */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <PillLink href="/shop" active={!activeCategory}>
          All Products
        </PillLink>
        {sortedCategories.map((cat) => (
          <PillLink key={cat.id} href={`/shop/${cat.slug}`} active={activeCategory === cat.slug}>
            {cat.name}
          </PillLink>
        ))}
      </div>

      {/* Product grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-16 flex flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-100 text-rose-300">
              <PackageSearch className="h-7 w-7" />
            </div>
            <p className="mt-4 font-display text-xl font-semibold text-rose-800">No products found</p>
            <p className="mt-1 text-sm text-rose-500/70">Check back soon — we&apos;re always crafting new pieces.</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeCategory ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <MotionLink
      href={href}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      className={`chip border transition-colors ${
        active ? 'border-rose-500 bg-rose-500 text-white' : 'border-cream-300 bg-white text-rose-700 hover:border-rose-300'
      }`}
    >
      {children}
    </MotionLink>
  );
}
