import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/format';

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { isOpen, closeCart, items, updateQuantity, removeItem, totalAmount, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-rose-900/30 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-float"
          >
        <div className="flex items-center justify-between border-b border-cream-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-rose-600" />
            <h2 className="font-display text-lg font-600 text-rose-900">
              Your Cart {totalItems > 0 && `(${totalItems})`}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-full text-rose-500 transition-colors hover:bg-rose-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-100 text-rose-300">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <p className="mt-4 font-display text-lg font-600 text-rose-800">Your cart is empty</p>
            <p className="mt-1 text-sm text-rose-500/70">Add some handmade magic to get started.</p>
            <button onClick={closeCart} className="btn-primary mt-6">Browse Products</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100">
                      {item.product.image_url && (
                        <img src={item.product.image_url} alt={item.product.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-sm font-600 leading-snug text-rose-900">{item.product.name}</h3>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="flex-shrink-0 text-rose-300 transition-colors hover:text-rose-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-rose-500/70">{formatPrice(item.product.price)}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-600 text-rose-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-rose-600 transition-colors hover:bg-rose-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-display text-sm font-700 text-rose-700">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="border-t border-cream-200 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-rose-600">Total</span>
                <span className="font-display text-2xl font-700 text-rose-900">{formatPrice(totalAmount)}</span>
              </div>
              <p className="mt-1 text-xs text-rose-400">No online payment — we'll contact you to confirm your order.</p>
              <button onClick={onCheckout} className="btn-primary mt-4 w-full">
                Place Order Request
              </button>
            </div>
          </>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
