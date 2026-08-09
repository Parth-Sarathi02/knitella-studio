import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Package, Tag, LogOut, Sparkles, Plus, X, Edit3, Trash2, ChevronRight, Phone, Mail, MapPin, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime, slugify } from '@/lib/format';
import type { Category, Product, Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/types';
import { navigate } from '@/lib/router';

type Tab = 'dashboard' | 'orders' | 'products' | 'categories';

export function AdminDashboard() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [catRes, prodRes, orderRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
    ]);
    setCategories(catRes.data ?? []);
    setProducts(prodRes.data ?? []);
    setOrders(orderRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = {
    totalOrders: orders.length,
    newOrders: orders.filter((o) => o.status === 'new').length,
    totalRevenue: orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0),
    totalProducts: products.length,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Top bar */}
      <div className="border-b border-cream-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="leading-none">
              <span className="block font-display text-sm font-600 text-rose-900">Knitella Studio</span>
              <span className="block text-[10px] uppercase tracking-wider text-rose-400">Admin</span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="btn-ghost text-sm">View Store</button>
            <button onClick={handleSignOut} className="btn-ghost text-sm text-rose-600">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide rounded-2xl bg-white p-1.5 shadow-soft">
          {[
            { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders' as Tab, label: `Orders${stats.newOrders > 0 ? ` (${stats.newOrders})` : ''}`, icon: ShoppingBag },
            { id: 'products' as Tab, label: 'Products', icon: Package },
            { id: 'categories' as Tab, label: 'Categories', icon: Tag },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-rose-500 text-white shadow-soft' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-rose-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
            </div>
          ) : (
            <>
              {tab === 'dashboard' && <DashboardTab stats={stats} orders={orders} products={products} categories={categories} setTab={setTab} />}
              {tab === 'orders' && <OrdersTab orders={orders} onUpdate={loadData} />}
              {tab === 'products' && <ProductsTab products={products} categories={categories} onUpdate={loadData} />}
              {tab === 'categories' && <CategoriesTab categories={categories} products={products} onUpdate={loadData} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Dashboard Tab ---------- */

function DashboardTab({ stats, orders, products, categories, setTab }: {
  stats: { totalOrders: number; newOrders: number; totalRevenue: number; totalProducts: number };
  orders: Order[];
  products: Product[];
  categories: Category[];
  setTab: (t: Tab) => void;
}) {
  const recentOrders = orders.slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-sky-100 text-sky-700' },
          { label: 'New Orders', value: stats.newOrders, icon: Clock, color: 'bg-gold-100 text-gold-700' },
          { label: 'Potential Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'bg-sage-100 text-sage-700' },
          { label: 'Products', value: stats.totalProducts, icon: Package, color: 'bg-rose-100 text-rose-700' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-display text-2xl font-700 text-rose-900">{s.value}</p>
            <p className="text-xs uppercase tracking-wider text-rose-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-600 text-rose-900">Recent Orders</h2>
          <button onClick={() => setTab('orders')} className="text-sm font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-rose-400">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-3">
                <div>
                  <p className="text-sm font-600 text-rose-900">{order.customer_name}</p>
                  <p className="text-xs text-rose-400">{formatDateTime(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`chip ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  <span className="text-sm font-700 text-rose-900">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-600 text-rose-900">Quick Actions</h2>
          <div className="mt-4 space-y-2">
            <button onClick={() => setTab('products')} className="flex w-full items-center gap-3 rounded-xl bg-cream-50 px-4 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50">
              <Plus className="h-4 w-4" /> Add a new product
            </button>
            <button onClick={() => setTab('categories')} className="flex w-full items-center gap-3 rounded-xl bg-cream-50 px-4 py-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50">
              <Plus className="h-4 w-4" /> Add a new category
            </button>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-display text-lg font-600 text-rose-900">Store Overview</h2>
          <div className="mt-4 space-y-2">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category_id === cat.id).length;
              return (
                <div key={cat.id} className="flex items-center justify-between rounded-xl bg-cream-50 px-4 py-2.5 text-sm">
                  <span className="font-medium text-rose-700">{cat.name}</span>
                  <span className="text-rose-400">{count} products</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Orders Tab ---------- */

function OrdersTab({ orders, onUpdate }: { orders: Order[]; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    onUpdate();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'contacted', 'confirmed', 'fulfilled', 'cancelled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`chip border transition-all ${
              filter === s ? 'border-rose-500 bg-rose-500 text-white' : 'border-cream-300 bg-white text-rose-700 hover:border-rose-300'
            }`}
          >
            {s === 'all' ? 'All' : ORDER_STATUS_LABELS[s]}
            {s !== 'all' && ` (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 card p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-rose-200" />
          <p className="mt-3 font-display text-lg font-600 text-rose-800">No orders here</p>
          <p className="text-sm text-rose-400">New order requests will appear here.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="card overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-600 text-rose-900">{order.customer_name}</p>
                    <p className="text-xs text-rose-400">{formatDateTime(order.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`chip ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  <span className="font-display text-sm font-700 text-rose-900">{formatPrice(Number(order.total))}</span>
                  <ChevronRight className={`h-4 w-4 text-rose-400 transition-transform ${expanded === order.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-cream-200 bg-cream-50 px-5 py-5 animate-fade-in">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Customer info */}
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-400">Customer</p>
                      <div className="space-y-2 text-sm text-rose-700">
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-rose-400" /> {order.customer_phone}</p>
                        {order.customer_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-rose-400" /> {order.customer_email}</p>}
                        {order.delivery_address && <p className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-rose-400 flex-shrink-0" /> {order.delivery_address}</p>}
                      </div>
                      {order.notes && (
                        <div className="mt-3 rounded-xl bg-white p-3 text-sm text-rose-700">
                          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-rose-400">Notes</p>
                          {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Order items */}
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-400">Items</p>
                      <div className="space-y-2">
                        {(order.order_items ?? []).map((item) => (
                          <div key={item.id} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm">
                            <span className="text-rose-700">{item.product_name} × {item.quantity}</span>
                            <span className="font-medium text-rose-900">{formatPrice(Number(item.line_total))}</span>
                          </div>
                        ))}
                        <div className="flex justify-between border-t border-cream-200 pt-2 text-sm">
                          <span className="font-600 text-rose-900">Total</span>
                          <span className="font-700 text-rose-700">{formatPrice(Number(order.total))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status changer */}
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-rose-400">Update Status</p>
                    <div className="flex flex-wrap gap-2">
                      {(['new', 'contacted', 'confirmed', 'fulfilled', 'cancelled'] as OrderStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`chip border transition-all ${
                            order.status === s
                              ? 'border-rose-500 bg-rose-500 text-white'
                              : 'border-cream-300 bg-white text-rose-700 hover:border-rose-300'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Products Tab ---------- */

function ProductsTab({ products, categories, onUpdate }: { products: Product[]; categories: Category[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const handleEdit = (product: Product) => {
    setEditing(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-600 text-rose-900">Products ({products.length})</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); onUpdate(); }}
        />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const cat = categories.find((c) => c.id === p.category_id);
          return (
            <div key={p.id} className="card overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-rose-200 text-xs">No img</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-600 text-rose-900">{p.name}</p>
                      <p className="text-xs text-rose-400">{cat?.name ?? 'Uncategorised'}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50" aria-label="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <span className="font-display text-sm font-700 text-rose-700">{formatPrice(p.price)}</span>
                    {p.featured && <span className="chip bg-gold-100 text-gold-700">Featured</span>}
                    {!p.active && <span className="chip bg-cream-200 text-rose-500">Hidden</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSaved }: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    image_url: product?.image_url ?? '',
    category_id: product?.category_id ?? categories[0]?.id ?? '',
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    sort_order: product?.sort_order?.toString() ?? '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      featured: form.featured,
      active: form.active,
      sort_order: parseInt(form.sort_order) || 0,
    };

    const { error } = product
      ? await supabase.from('products').update(payload).eq('id', product.id)
      : await supabase.from('products').insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-4xl bg-cream-50 shadow-float animate-scale-in">
        <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <h2 className="font-display text-lg font-700 text-rose-900">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-rose-400 hover:bg-rose-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Product Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Rosé Romance Bouquet" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px] resize-none" placeholder="A beautiful handmade..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-800">Price (₹) *</label>
              <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="599" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-800">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Image URL</label>
            <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://..." />
            {form.image_url && (
              <div className="mt-2 h-32 overflow-hidden rounded-xl bg-cream-100">
                <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-rose-800">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" placeholder="0" />
            </div>
            <div className="flex items-end gap-4 pb-1">
              <label className="flex items-center gap-2 text-sm font-medium text-rose-800">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 rounded text-rose-500 focus:ring-rose-200" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-rose-800">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 rounded text-rose-500 focus:ring-rose-200" />
                Active
              </label>
            </div>
          </div>

          {error && <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Categories Tab ---------- */

function CategoriesTab({ categories, products, onUpdate }: { categories: Category[]; products: Product[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const handleDelete = async (id: string) => {
    const count = products.filter((p) => p.category_id === id).length;
    if (count > 0) {
      alert(`This category has ${count} products. Move or delete them first.`);
      return;
    }
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    onUpdate();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-600 text-rose-900">Categories ({categories.length})</h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); onUpdate(); }}
        />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const count = products.filter((p) => p.category_id === c.id).length;
          return (
            <div key={c.id} className="card overflow-hidden">
              <div className="flex gap-3 p-3">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-cream-100">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-rose-200 text-xs">No img</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-sm font-600 text-rose-900">{c.name}</p>
                      <p className="text-xs text-rose-400">/{c.slug}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(c); setShowForm(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50" aria-label="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-rose-500/70">{c.description}</p>
                  <p className="mt-auto pt-1 text-xs text-rose-400">{count} products</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryForm({ category, onClose, onSaved }: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name ?? '',
    description: category?.description ?? '',
    image_url: category?.image_url ?? '',
    sort_order: category?.sort_order?.toString() ?? '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const slug = slugify(form.name);
    const payload = {
      name: form.name,
      slug,
      description: form.description,
      image_url: form.image_url || null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    const { error } = category
      ? await supabase.from('categories').update(payload).eq('id', category.id)
      : await supabase.from('categories').insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-4xl bg-cream-50 shadow-float animate-scale-in">
        <div className="flex items-center justify-between border-b border-cream-200 px-6 py-4">
          <h2 className="font-display text-lg font-700 text-rose-900">{category ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-rose-400 hover:bg-rose-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Category Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Bouquets" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[60px] resize-none" placeholder="Handcrafted bouquets..." />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Image URL</label>
            <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://..." />
            {form.image_url && (
              <div className="mt-2 h-32 overflow-hidden rounded-xl bg-cream-100">
                <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-rose-800">Sort Order</label>
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" placeholder="0" />
          </div>

          {error && <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : category ? 'Save Changes' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
