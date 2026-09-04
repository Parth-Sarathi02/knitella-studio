import { useRef } from 'react';
import { ArrowRight, Sparkles, Heart, Gift, Scissors, Instagram, Wand2, PenTool, PackageCheck } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/Reveal';
import { WireSquiggle, WireDivider } from '@/components/WireSquiggle';
import { Marquee } from '@/components/Marquee';
import { accentFor } from '@/lib/category-style';
import { navigate } from '@/lib/router';

interface HomePageProps {
  categories: Category[];
  products: Product[];
}

const PROCESS_STEPS = [
  {
    icon: PenTool,
    title: 'Twist',
    desc: 'Every stem starts as plain, colourful wire — hand-twisted into shape, no two exactly alike.',
  },
  {
    icon: Wand2,
    title: 'Shape',
    desc: 'Petals, faces, and tiny details are formed by hand until the piece feels just right.',
  },
  {
    icon: PackageCheck,
    title: 'Finish',
    desc: 'Trimmed, fluffed, and gift-wrapped with care before it heads your way.',
  },
];

export function HomePage({ categories, products }: HomePageProps) {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);
  const instagramProducts = products.slice(0, 5);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroFade = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-rose-50">
        <motion.div style={{ y: blobY1 }} className="absolute right-0 top-0 -z-0 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
        <motion.div style={{ y: blobY2 }} className="absolute bottom-0 left-0 -z-0 h-80 w-80 rounded-full bg-sage-200/30 blur-3xl" />

        {/* Floating decorative squiggles */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <WireSquiggle className="absolute left-[6%] top-[18%] h-3 w-16 text-gold-400 animate-float-slow" animate={false} />
          <WireSquiggle className="absolute right-[8%] top-[38%] h-3 w-20 text-sky-400 animate-float" animate={false} />
          <WireSquiggle className="absolute left-[12%] bottom-[12%] h-3 w-14 text-sage-400 animate-float-slow" animate={false} />
        </div>

        <motion.div style={{ opacity: heroFade }} className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="chip bg-rose-100 text-rose-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Handmade with love
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-5 font-display text-5xl font-700 leading-[1.1] text-rose-900 text-balance sm:text-6xl"
              >
                Handmade pipe cleaner magic, crafted one{' '}
                <span className="relative inline-block whitespace-nowrap font-display italic text-rose-600">
                  twist
                  <WireSquiggle className="absolute -bottom-2 left-0 h-3 w-full text-rose-400" color="#e67a98" delay={0.6} />
                </span>{' '}
                at a time.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 max-w-md text-lg leading-relaxed text-rose-700/80"
              >
                Bouquets, desk buddies, flowers, and keychains — each piece is uniquely handcrafted to bring a little joy into your everyday.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <button onClick={() => navigate('/shop')} className="btn-primary">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/shop/bouquets')} className="btn-secondary">
                  Explore Bouquets
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-10 flex gap-8"
              >
                {[
                  { value: `${products.length}+`, label: 'Unique Pieces' },
                  { value: `${categories.length}`, label: 'Collections' },
                  { value: '100%', label: 'Handmade' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl font-700 text-rose-700">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wider text-rose-400">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative grid grid-cols-2 gap-4">
                {sortedCategories.slice(0, 4).map((cat, i) => {
                  const accent = accentFor(i);
                  return (
                    <motion.button
                      key={cat.id}
                      onClick={() => navigate(`/shop/${cat.slug}`)}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className={`group relative overflow-hidden rounded-3xl shadow-card ${i % 2 === 0 ? 'mt-0' : 'mt-8'}`}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-cream-100">
                        {cat.image_url && (
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-transparent to-transparent" />
                      <span className={`absolute right-3 top-3 h-2.5 w-2.5 rounded-full ${accent.solid}`} />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <p className="font-display text-lg font-600 text-white">{cat.name}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Marquee ticker */}
      <div className="border-y border-cream-200 bg-rose-500 py-3 text-white">
        <Marquee items={['Handmade with love', 'Made to order', 'Customisable colours', 'Gift-ready packaging', 'One-of-a-kind pieces']} />
      </div>

      {/* Values strip */}
      <section className="border-b border-cream-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Scissors, title: 'Handcrafted', desc: 'Every piece made by hand' },
            { icon: Heart, title: 'Made to Order', desc: 'Customise colours & details' },
            { icon: Gift, title: 'Gift Ready', desc: 'Beautifully packaged with love' },
          ].map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08} y={16}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <v.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-600 text-rose-900">{v.title}</p>
                  <p className="text-xs text-rose-500/70">{v.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="chip bg-sage-100 text-sage-700">Browse by category</span>
          <h2 className="mt-3 font-display text-4xl font-700 text-rose-900">Find your perfect piece</h2>
          <p className="mt-2 text-rose-600/70">Explore our collections of handmade pipe cleaner creations</p>
        </Reveal>
        <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sortedCategories.map((cat, i) => {
            const accent = accentFor(i);
            return (
              <StaggerItem key={cat.id}>
                <button onClick={() => navigate(`/shop/${cat.slug}`)} className="group block w-full text-left">
                  <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="card overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                      {cat.image_url && (
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <span className={`absolute left-3 top-3 h-2.5 w-2.5 rounded-full ${accent.solid} ring-4 ring-white/60`} />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-600 text-rose-900">{cat.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-rose-600/70 line-clamp-2">{cat.description}</p>
                      <span className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${accent.text} transition-all group-hover:gap-2`}>
                        Shop now <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </motion.div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      <WireDivider className="mx-auto max-w-4xl" color="#c7d8c2" />

      {/* Process */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="chip bg-rose-100 text-rose-700">How it's made</span>
          <h2 className="mt-3 font-display text-4xl font-700 text-rose-900">From plain wire to keepsake</h2>
          <p className="mx-auto mt-2 max-w-lg text-rose-600/70">Three hands-on steps, followed for every single piece.</p>
        </Reveal>
        <div className="relative mt-14 grid gap-10 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-8 hidden sm:block">
            <WireDivider color="#f0a7ba" className="opacity-60" />
          </div>
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.15} y={24} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-rose-600 shadow-card">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="mt-4 font-display text-xs font-700 uppercase tracking-[0.3em] text-rose-400">
                0{i + 1}
              </p>
              <h3 className="mt-1 font-display text-xl font-600 text-rose-900">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[220px] text-sm leading-relaxed text-rose-600/70">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="bg-cream-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="flex items-end justify-between">
              <div>
                <span className="chip bg-gold-100 text-gold-700">Customer favourites</span>
                <h2 className="mt-3 font-display text-4xl font-700 text-rose-900">Featured pieces</h2>
              </div>
              <button onClick={() => navigate('/shop')} className="btn-ghost hidden sm:flex">
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram strip */}
      {instagramProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="chip bg-sky-100 text-sky-700">
                <Instagram className="h-3.5 w-3.5" />
                Behind the scenes
              </span>
              <h2 className="mt-3 font-display text-3xl font-700 text-rose-900">Follow the making of it</h2>
            </div>
            <a
              href="https://www.instagram.com/knitella.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              @knitella.studio <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
          <StaggerGroup className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5" stagger={0.06}>
            {instagramProducts.map((p) => (
              <StaggerItem key={p.id} y={16}>
                <a
                  href="https://www.instagram.com/knitella.studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-2xl bg-cream-100"
                >
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-rose-900/0 transition-colors duration-300 group-hover:bg-rose-900/30">
                    <Instagram className="h-6 w-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </a>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-rose-500 to-rose-700 px-8 py-12 text-center shadow-float sm:px-16 sm:py-16">
            <motion.div
              className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <div className="relative">
              <h2 className="font-display text-3xl font-700 text-white sm:text-4xl">Have something special in mind?</h2>
              <p className="mx-auto mt-3 max-w-md text-rose-100">
                We take custom orders! Whether it's a specific colour, a themed bouquet, or a unique gift — let's create something together.
              </p>
              <motion.button
                onClick={() => navigate('/shop')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-700 shadow-soft"
              >
                Start Browsing <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
