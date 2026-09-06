'use client';

import { Sparkles, AtSign, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { WireDivider } from '@/components/WireSquiggle';

interface FooterProps {
  categories: { slug: string; name: string }[];
}

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-cream-200 bg-cream-100">
      <WireDivider color="#e0c79e" className="max-w-7xl mx-auto -translate-y-1/2" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="leading-none">
                <span className="block font-display text-lg font-semibold text-rose-900">Knitella</span>
                <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-rose-400">Studio</span>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-rose-700/80">
              Handmade pipe cleaner magic — crafted with love, one twist at a time. Every piece is unique, just like the person receiving it.
            </p>
            <div className="mt-5 flex gap-3">
              <motion.a
                href="https://www.instagram.com/knitella.studio/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ rotate: [0, -10, 10, -6, 0], scale: 1.08 }}
                transition={{ duration: 0.5 }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-rose-600 shadow-soft transition-colors hover:bg-rose-50 hover:text-rose-700"
                aria-label="Instagram"
              >
                <AtSign className="h-4.5 w-4.5" />
              </motion.a>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-rose-900">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/shop" className="text-rose-700/80 transition-colors hover:text-rose-900">All Products</Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/shop/${c.slug}`} className="text-rose-700/80 transition-colors hover:text-rose-900">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-rose-900">Studio</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/admin" className="text-rose-700/80 transition-colors hover:text-rose-900">Admin Panel</Link>
              </li>
              <li className="text-rose-700/80">Custom Orders Welcome</li>
              <li className="text-rose-700/80">Made in India</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-cream-200 pt-6 sm:flex-row">
          <p className="text-xs text-rose-500/70">© {new Date().getFullYear()} Knitella Studio. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-xs text-rose-500/70">
            Made with <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" /> and pipe cleaners
          </p>
        </div>
      </div>
    </footer>
  );
}
