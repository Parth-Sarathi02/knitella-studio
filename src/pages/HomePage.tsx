import { ArrowRight, Sparkles, Heart, Gift, Scissors } from 'lucide-react';
import type { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { navigate } from '@/lib/router';

interface HomePageProps {
  categories: Category[];
  products: Product[];
}

export function HomePage({ categories, products }: HomePageProps) {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-rose-50">
        <div className="absolute right-0 top-0 -z-0 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-0 h-80 w-80 rounded-full bg-sage-200/30 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              <span className="chip bg-rose-100 text-rose-700">
                <Sparkles className="h-3.5 w-3.5" />
                Handmade with love
              </span>
              <h1 className="mt-5 font-display text-5xl font-700 leading-[1.1] text-rose-900 text-balance sm:text-6xl">
                Handmade pipe cleaner magic, crafted one twist at a time.
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-rose-700/80">
                Bouquets, desk buddies, flowers, and keychains — each piece is uniquely handcrafted to bring a little joy into your everyday.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => navigate('/shop')} className="btn-primary">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => navigate('/shop/bouquets')} className="btn-secondary">
                  Explore Bouquets
                </button>
              </div>
              <div className="mt-10 flex gap-8">
                <div>
                  <p className="font-display text-2xl font-700 text-rose-700">{products.length}+</p>
                  <p className="text-xs uppercase tracking-wider text-rose-400">Unique Pieces</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-700 text-rose-700">{categories.length}</p>
                  <p className="text-xs uppercase tracking-wider text-rose-400">Collections</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-700 text-rose-700">100%</p>
                  <p className="text-xs uppercase tracking-wider text-rose-400">Handmade</p>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-up" style={{ animationDelay: '150ms' }}>
              <div className="relative grid grid-cols-2 gap-4">
                {sortedCategories.slice(0, 4).map((cat, i) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/shop/${cat.slug}`)}
                    className={`group relative overflow-hidden rounded-3xl shadow-card transition-all duration-300 hover:shadow-float hover:-translate-y-1 ${
                      i % 2 === 0 ? 'mt-0' : 'mt-8'
                    }`}
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
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                      <p className="font-display text-lg font-600 text-white">{cat.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="border-y border-cream-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: Scissors, title: 'Handcrafted', desc: 'Every piece made by hand' },
            { icon: Heart, title: 'Made to Order', desc: 'Customise colours & details' },
            { icon: Gift, title: 'Gift Ready', desc: 'Beautifully packaged with love' },
          ].map((v) => (
            <div key={v.title} className="flex items-center gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <v.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-600 text-rose-900">{v.title}</p>
                <p className="text-xs text-rose-500/70">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="chip bg-sage-100 text-sage-700">Browse by category</span>
          <h2 className="mt-3 font-display text-4xl font-700 text-rose-900">Find your perfect piece</h2>
          <p className="mt-2 text-rose-600/70">Explore our collections of handmade pipe cleaner creations</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sortedCategories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/shop/${cat.slug}`)}
              className="group animate-fade-up text-left"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="card overflow-hidden transition-all duration-300 hover:shadow-float hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                  {cat.image_url && (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-600 text-rose-900">{cat.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-rose-600/70 line-clamp-2">{cat.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rose-600 transition-all group-hover:gap-2">
                    Shop now <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="bg-cream-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <span className="chip bg-gold-100 text-gold-700">Customer favourites</span>
                <h2 className="mt-3 font-display text-4xl font-700 text-rose-900">Featured pieces</h2>
              </div>
              <button onClick={() => navigate('/shop')} className="btn-ghost hidden sm:flex">
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-rose-500 to-rose-700 px-8 py-12 text-center shadow-float sm:px-16 sm:py-16">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-700 text-white sm:text-4xl">Have something special in mind?</h2>
            <p className="mx-auto mt-3 max-w-md text-rose-100">
              We take custom orders! Whether it's a specific colour, a themed bouquet, or a unique gift — let's create something together.
            </p>
            <button onClick={() => navigate('/shop')} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-rose-700 shadow-soft transition-all hover:scale-105">
              Start Browsing <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
