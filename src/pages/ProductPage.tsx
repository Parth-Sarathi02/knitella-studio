import { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingBag, Check, Heart, Truck, Shield, Sparkles } from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/cart-context';
import { navigate } from '@/lib/router';

interface ProductPageProps {
  product: Product;
  category?: Category;
  relatedProducts: Product[];
}

export function ProductPage({ product, category, relatedProducts }: ProductPageProps) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    openCart();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate('/shop')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-colors hover:text-rose-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop
      </button>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="animate-fade-up">
          <div className="card overflow-hidden">
            <div className="aspect-square bg-cream-100">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-rose-200">No image</div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
          {category && (
            <button
              onClick={() => navigate(`/shop/${category.slug}`)}
              className="chip bg-rose-100 text-rose-700 transition-colors hover:bg-rose-200"
            >
              {category.name}
            </button>
          )}
          <h1 className="mt-3 font-display text-3xl font-700 text-rose-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-2 font-display text-3xl font-700 text-rose-700">{formatPrice(product.price)}</p>
          <p className="mt-4 leading-relaxed text-rose-700/80">{product.description}</p>

          {/* Quantity selector */}
          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-rose-800">Quantity</label>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-white p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-100"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-display text-lg font-600 text-rose-900">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-100"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleBuyNow} className="btn-primary flex-1">
              <ShoppingBag className="h-4 w-4" />
              Order Now
            </button>
            <button onClick={handleAdd} className="btn-secondary flex-1">
              {added ? (
                <>
                  <Check className="h-4 w-4 text-sage-600" />
                  Added!
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 space-y-3 rounded-2xl bg-cream-100 p-5">
            {[
              { icon: Sparkles, text: 'Handcrafted with care — each piece is unique' },
              { icon: Heart, text: 'Custom colours and personalisation available' },
              { icon: Truck, text: 'Made to order — please allow a few days for crafting' },
              { icon: Shield, text: 'No online payment — pay after we confirm your order' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-rose-700/80">
                <item.icon className="h-4 w-4 flex-shrink-0 text-rose-500" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-700 text-rose-900">You might also like</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p, i) => (
              <ProductCardMini key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductCardMini({ product, index }: { product: Product; index: number }) {
  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group cursor-pointer animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-float hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-cream-100">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-display text-sm font-600 text-rose-900 leading-snug">{product.name}</h3>
          <p className="mt-1.5 font-display text-base font-700 text-rose-700">{formatPrice(product.price)}</p>
        </div>
      </div>
    </div>
  );
}
