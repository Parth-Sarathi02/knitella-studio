import type { Metadata } from 'next';
import { ShopPageClient } from '@/components/ShopPageClient';
import { getCategories, getActiveProducts } from '@/lib/data';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: `Browse the full ${SITE_NAME} collection — handmade pipe cleaner bouquets, desk buddies, flowers, and keychains, made to order.`,
  alternates: { canonical: '/shop' },
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([getCategories(), getActiveProducts()]);
  return <ShopPageClient categories={categories} products={products} />;
}
