import { useMemo } from 'react';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

interface ShopPageProps {
  categories: Category[];
  products: Product[];
  activeCategory?: string;
}

export function ShopPage({ categories, products, activeCategory }: ShopPageProps) {
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    const cat = categories.find((c) => c.slug === activeCategory);
    if (!cat) return products;
    return products.filter((p) => p.category_id === cat.id);
  }, [products, categories, activeCategory]);

  const currentCategory = categories.find((c) => c.slug === activeCategory);
  const title = currentCategory ? currentCategory.name : 'All Products';
  const description = currentCategory ? currentCategory.description : 'Browse our full collection of handmade pipe cleaner creations.';

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-display text-4xl font-700 text-rose-900 sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-rose-600/70">{description}</p>
      </div>

      {/* Category pills */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <a
          href="#/shop"
          className={`chip border transition-all ${
            !activeCategory
              ? 'border-rose-500 bg-rose-500 text-white'
              : 'border-cream-300 bg-white text-rose-700 hover:border-rose-300'
          }`}
        >
          All Products
        </a>
        {sortedCategories.map((cat) => (
          <a
            key={cat.id}
            href={`#/shop/${cat.slug}`}
            className={`chip border transition-all ${
              activeCategory === cat.slug
                ? 'border-rose-500 bg-rose-500 text-white'
                : 'border-cream-300 bg-white text-rose-700 hover:border-rose-300'
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="font-display text-xl font-600 text-rose-800">No products found</p>
          <p className="mt-1 text-sm text-rose-500/70">Check back soon — we're always crafting new pieces.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
