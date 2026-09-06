import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/ProductPageClient';
import { getActiveProducts, getProductById, getCategories } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/site';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await getActiveProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: 'Product not found' };

  const description =
    product.description || `${product.name} — a handmade pipe cleaner creation from ${SITE_NAME}, made to order.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const [product, allProducts, categories] = await Promise.all([
    getProductById(id),
    getActiveProducts(),
    getCategories(),
  ]);

  if (!product || !product.active) notFound();

  const category = categories.find((c) => c.id === product.category_id);
  const relatedProducts = allProducts
    .filter((p) => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.image_url || undefined,
    category: category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductPageClient product={product} category={category} relatedProducts={relatedProducts} />
    </>
  );
}
