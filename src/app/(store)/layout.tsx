import { StoreShell } from '@/components/StoreShell';
import { getCategories, toHeaderCategories } from '@/lib/data';

export const revalidate = 3600;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return <StoreShell categories={toHeaderCategories(categories)}>{children}</StoreShell>;
}
