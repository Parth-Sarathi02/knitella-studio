const ACCENTS = [
  { name: 'rose', chip: 'bg-rose-100 text-rose-700', solid: 'bg-rose-500', text: 'text-rose-600', ring: 'from-rose-400 to-rose-600', hex: '#e67a98' },
  { name: 'sky', chip: 'bg-sky-100 text-sky-700', solid: 'bg-sky-500', text: 'text-sky-600', ring: 'from-sky-400 to-sky-600', hex: '#54a1c9' },
  { name: 'sage', chip: 'bg-sage-100 text-sage-700', solid: 'bg-sage-500', text: 'text-sage-600', ring: 'from-sage-400 to-sage-600', hex: '#7f9d76' },
  { name: 'gold', chip: 'bg-gold-100 text-gold-700', solid: 'bg-gold-500', text: 'text-gold-600', ring: 'from-gold-400 to-gold-600', hex: '#e8b04c' },
] as const;

export function accentFor(index: number) {
  return ACCENTS[index % ACCENTS.length];
}
