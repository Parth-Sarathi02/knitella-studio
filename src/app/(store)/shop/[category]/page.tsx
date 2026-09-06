import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopPageClient } from '@/components/ShopPageClient';
import { getCategories, getActiveProducts } from '@/lib/data';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) return { title: 'Category not found' };

  return {
    title: category.name,
    description: category.description || `Shop handmade ${category.name} at ${SITE_NAME} — made to order, one piece at a time.`,
    alternates: { canonical: `/shop/${category.slug}` },
    openGraph: category.image_url ? { images: [{ url: category.image_url }] } : undefined,
  };
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const [categories, products] = await Promise.all([getCategories(), getActiveProducts()]);

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return <ShopPageClient categories={categories} products={products} activeCategory={slug} />;
}
