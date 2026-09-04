import { Plus, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  const ref = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 250, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 250, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };
  const handleMouseLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const goToProduct = () => navigate(`/product/${product.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={goToProduct}
      className="group h-full cursor-pointer"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        whileHover={{ y: -6 }}
        className="card flex h-full flex-col overflow-hidden shadow-card transition-shadow duration-300 hover:shadow-float"
      >
        <div className="relative aspect-square overflow-hidden bg-cream-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-rose-200">
              <span className="text-sm">No image</span>
            </div>
          )}
          {product.featured && (
            <span className="absolute left-3 top-3 chip bg-rose-500 text-white shadow-soft">Featured</span>
          )}
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-rose-600 shadow-card transition-colors duration-200 hover:bg-rose-500 hover:text-white"
            aria-label="Add to cart"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? 'check' : 'plus'}
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ duration: 0.18 }}
                className="flex"
              >
                {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
        <div className="flex flex-1 flex-col p-4" style={{ transform: 'translateZ(20px)' }}>
          <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-600 leading-snug text-rose-900">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs leading-relaxed text-rose-600/70">
            {product.description || '\u00A0'}
          </p>
          <p className="mt-auto pt-3 font-display text-lg font-700 text-rose-700">{formatPrice(product.price)}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
