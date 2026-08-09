import { useState } from 'react';
import { X, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'submitting' | 'success' | 'error';

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalAmount, clearCart, closeCart } = useCart();
  const [step, setStep] = useState<Step>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_address: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    setErrorMsg('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_email: form.customer_email,
          delivery_address: form.delivery_address,
          notes: form.notes,
          total: totalAmount,
          status: 'new',
        })
        .select()
        .single();

      if (orderError) throw new Error(orderError.message);

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        unit_price: item.product.price,
        quantity: item.quantity,
        line_total: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw new Error(itemsError.message);

      setStep('success');
      clearCart();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      setStep('form');
      setForm({ customer_name: '', customer_phone: '', customer_email: '', delivery_address: '', notes: '' });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-4xl bg-cream-50 shadow-float animate-scale-in">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-rose-400 transition-colors hover:bg-rose-100"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'success' ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-sage-600 animate-scale-in">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-700 text-rose-900">Order Request Received!</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-rose-600/80">
              Thank you, {form.customer_name.split(' ')[0]}! We've received your order request. Knitella Studio will contact you shortly to confirm the details and arrange payment.
            </p>
            <div className="mt-6 w-full rounded-2xl bg-white p-4 text-left shadow-soft">
              <p className="text-xs font-medium uppercase tracking-wider text-rose-400">What happens next</p>
              <ol className="mt-2 space-y-1.5 text-sm text-rose-700">
                <li>1. We review your order and reach out via phone or email.</li>
                <li>2. We confirm availability, customisation, and delivery.</li>
                <li>3. Payment is arranged directly (UPI, bank transfer, or cash).</li>
              </ol>
            </div>
            <button onClick={handleClose} className="btn-primary mt-6">Continue Shopping</button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-rose-600" />
              <h2 className="font-display text-xl font-700 text-rose-900">Place Order Request</h2>
            </div>
            <p className="mt-1 text-sm text-rose-500/70">
              No online payment needed — fill in your details and we'll contact you to confirm.
            </p>

            <div className="mt-5 rounded-2xl bg-white p-4 shadow-soft">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-400">Order Summary</p>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-rose-700">{item.product.name} × {item.quantity}</span>
                    <span className="font-medium text-rose-900">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t border-cream-200 pt-3">
                <span className="font-display font-600 text-rose-900">Total</span>
                <span className="font-display text-lg font-700 text-rose-700">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-rose-800">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-rose-800">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    className="input-field"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-800">Email</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  className="input-field"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-800">Delivery Address</label>
                <textarea
                  value={form.delivery_address}
                  onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="House no, street, city, pincode"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-rose-800">Customisation Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field min-h-[60px] resize-none"
                  placeholder="Colours, gift wrapping, message on card..."
                />
              </div>

              {step === 'error' && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={step === 'submitting' || items.length === 0}
                className="btn-primary w-full"
              >
                {step === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Order Request'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
