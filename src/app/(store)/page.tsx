import type { Metadata } from 'next';
import { HomePageClient } from '@/components/HomePageClient';
import { getCategories, getActiveProducts } from '@/lib/data';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${SITE_NAME} — Handmade Pipe Cleaner Bouquets, Desk Buddies & Gifts`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getActiveProducts()]);
  return <HomePageClient categories={categories} products={products} />;
}
