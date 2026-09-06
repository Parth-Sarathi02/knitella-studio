import { supabaseServer } from '@/lib/supabase/server';
import type { Category, Product } from '@/lib/types';

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabaseServer.from('categories').select('*').order('sort_order');
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('active', true)
      .order('sort_order');
    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseServer.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ?? null;
  } catch (err) {
    console.error('Failed to fetch product:', err);
    return null;
  }
}

export function toHeaderCategories(categories: Category[]) {
  return categories.map((c) => ({ slug: c.slug, name: c.name }));
}
