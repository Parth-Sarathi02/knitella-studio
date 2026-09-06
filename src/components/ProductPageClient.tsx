'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingBag, Check, Heart, Truck, Shield, Sparkles } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { Product, Category } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/cart-context';
import { Reveal } from '@/components/Reveal';
import { WireSquiggle } from '@/components/WireSquiggle';

interface ProductPageProps {
  product: Product;
  category?: Category;
  relatedProducts: Product[];
}

export function ProductPageClient({ product, category, relatedProducts }: ProductPageProps) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

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
      <motion.div whileHover={{ x: -3 }} className="inline-block">
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 transition-colors hover:text-rose-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </motion.div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ perspective: 1000 }}
        >
          <motion.div
            ref={imgRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              mx.set(0.5);
              my.set(0.5);
            }}
            style={{ rotateX, rotateY }}
            className="card overflow-hidden"
          >
            <div className="aspect-square overflow-hidden bg-cream-100">
              {product.image_url ? (
                <motion.img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.4 }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-rose-200">No image</div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {category && (
            <Link href={`/shop/${category.slug}`} className="chip bg-rose-100 text-rose-700 transition-colors hover:bg-rose-200">
              {category.name}
            </Link>
          )}
          <h1 className="relative mt-3 inline-block font-display text-3xl font-bold text-rose-900 sm:text-4xl">
            {product.name}
            <WireSquiggle className="absolute -bottom-2 left-0 h-3 w-2/3 text-rose-300" color="#f0a7ba" />
          </h1>
          <p className="mt-5 font-display text-3xl font-bold text-rose-700">{formatPrice(product.price)}</p>
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={quantity}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="inline-block w-10 text-center font-display text-lg font-semibold text-rose-900"
                >
                  {quantity}
                </motion.span>
              </AnimatePresence>
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
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleBuyNow} className="btn-primary flex-1">
              <ShoppingBag className="h-4 w-4" />
              Order Now
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} className="btn-secondary flex-1">
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sage-600" />
                    Added!
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
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
        </motion.div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-rose-900">You might also like</h2>
          </Reveal>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      className="h-full"
    >
      <Link href={`/product/${product.id}`} className="group block h-full">
        <div className="card flex h-full flex-col overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-float">
          <div className="relative aspect-square overflow-hidden bg-cream-100">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 min-h-[2.5rem] font-display text-sm font-semibold leading-snug text-rose-900">
              {product.name}
            </h3>
            <p className="mt-auto pt-1.5 font-display text-base font-bold text-rose-700">{formatPrice(product.price)}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
