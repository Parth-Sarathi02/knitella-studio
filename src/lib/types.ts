export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  images: string[];
  featured: boolean;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  category?: Category;
}

export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'fulfilled' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  notes: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  confirmed: 'Confirmed',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-sky-100 text-sky-700',
  contacted: 'bg-gold-100 text-gold-700',
  confirmed: 'bg-sage-100 text-sage-700',
  fulfilled: 'bg-cream-200 text-rose-800',
  cancelled: 'bg-rose-100 text-rose-700',
};
