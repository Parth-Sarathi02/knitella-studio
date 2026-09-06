import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold text-rose-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-rose-900">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-sm text-rose-600/70">
        It might have been moved, sold out, or never existed. Let&apos;s get you back to the good stuff.
      </p>
      <Link href="/shop" className="btn-primary mt-6">
        Back to Shop
      </Link>
    </div>
  );
}
