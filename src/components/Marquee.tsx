'use client';

import { Sparkles } from 'lucide-react';

interface MarqueeProps {
  items: string[];
  className?: string;
}

export function Marquee({ items, className = '' }: MarqueeProps) {
  const track = [...items, ...items];
  return (
    <div className={`group overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex flex-shrink-0 items-center" aria-hidden={copy === 1}>
            {track.map((item, i) => (
              <span key={`${copy}-${i}`} className="mx-4 flex items-center gap-3 whitespace-nowrap">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.2em]">{item}</span>
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
