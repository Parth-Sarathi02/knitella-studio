/*
# Knitella Studio — initial schema

1. Purpose
   E-commerce storefront for handmade pipe-cleaner crafts (bouquets, desk buddies,
   flowers, keychains, etc.). No payment gateway — customers submit "order requests"
   with their contact + delivery info, and the owner manages everything from an admin
   panel. The owner signs in with email/password (Supabase Auth) to manage products,
   categories, and orders. Public visitors never sign in.

2. New Tables
   - `categories`
       id (uuid pk), name (text, unique), slug (text, unique), description (text),
       image_url (text), sort_order (int, default 0), created_at (timestamptz)
   - `products`
       id (uuid pk), category_id (uuid fk -> categories on delete cascade),
       name (text), description (text), price (numeric(10,2)),
       image_url (text), images (text[] — additional angles),
       featured (bool, default false), active (bool, default true),
       sort_order (int, default 0), created_at (timestamptz)
   - `orders`
       id (uuid pk), customer_name (text), customer_phone (text),
       customer_email (text), delivery_address (text),
       notes (text), status (text, default 'new'),
       total (numeric(10,2)), created_at (timestamptz)
   - `order_items`
       id (uuid pk), order_id (uuid fk -> orders on delete cascade),
       product_id (uuid fk -> products on delete set null),
       product_name (text), unit_price (numeric(10,2)),
       quantity (int), line_total (numeric(10,2))

3. Security
   - categories & products: public read (anon + authenticated SELECT), write only for
     authenticated owner (INSERT/UPDATE/DELETE). These are the catalog the public browses.
   - orders & order_items: anyone may INSERT a new order request (anon + authenticated),
     but only authenticated owner can SELECT/UPDATE/DELETE. Public visitors cannot read
     other people's orders. This is the inquiry-to-order model.
   - All tables have RLS enabled.

4. Notes
   - Status values for orders: 'new', 'contacted', 'confirmed', 'fulfilled', 'cancelled'.
   - Prices stored as numeric(10,2) in INR.
   - product_name and unit_price are copied onto order_items at order time so historical
     orders remain accurate even if a product is later renamed or repriced.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_categories" ON categories;
CREATE POLICY "owner_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_update_categories" ON categories;
CREATE POLICY "owner_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "owner_delete_categories" ON categories;
CREATE POLICY "owner_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  images text[] DEFAULT '{}',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_products" ON products;
CREATE POLICY "owner_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_update_products" ON products;
CREATE POLICY "owner_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "owner_delete_products" ON products;
CREATE POLICY "owner_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text DEFAULT '',
  delivery_address text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public can create order requests; only owner can read/update/delete them
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_read_orders" ON orders;
CREATE POLICY "owner_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "owner_update_orders" ON orders;
CREATE POLICY "owner_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "owner_delete_orders" ON orders;
CREATE POLICY "owner_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1,
  line_total numeric(10,2) NOT NULL DEFAULT 0
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_read_order_items" ON order_items;
CREATE POLICY "owner_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "owner_update_order_items" ON order_items;
CREATE POLICY "owner_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "owner_delete_order_items" ON order_items;
CREATE POLICY "owner_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
