import { Plus, Check } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/cart-context';
import { navigate } from '@/lib/router';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const goToProduct = () => navigate(`/product/${product.id}`);

  return (
    <div
      onClick={goToProduct}
      className="group cursor-pointer animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-float hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-cream-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-rose-200">
              <span className="text-sm">No image</span>
            </div>
          )}
          {product.featured && (
            <span className="absolute left-3 top-3 chip bg-rose-500 text-white shadow-soft">
              Featured
            </span>
          )}
          <button
            onClick={handleAdd}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-600 shadow-card transition-all duration-200 hover:bg-rose-500 hover:text-white active:scale-90"
            aria-label="Add to cart"
          >
            {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-display text-base font-600 text-rose-900 leading-snug">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-rose-600/70">{product.description}</p>
          <p className="mt-3 font-display text-lg font-700 text-rose-700">{formatPrice(product.price)}</p>
        </div>
      </div>
    </div>
  );
}
