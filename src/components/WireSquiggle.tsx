'use client';

import { motion } from 'framer-motion';

interface WireSquiggleProps {
  className?: string;
  color?: string;
  strokeWidth?: number;
  animate?: boolean;
  delay?: number;
}

/**
 * The brand's signature motif: a single bent, fuzzy "wire" line that reads
 * like a twisted pipe cleaner mid-craft. Used as heading underlines,
 * section dividers, and image frame accents throughout the site.
 */
export function WireSquiggle({
  className = 'h-4 w-32',
  color = 'currentColor',
  strokeWidth = 6,
  animate = true,
  delay = 0,
}: WireSquiggleProps) {
  return (
    <svg viewBox="0 0 200 24" fill="none" className={className} preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d="M2 18C14 4 22 4 32 14C42 24 52 24 62 12C74 -2 86 2 96 14C106 26 118 22 128 10C138 -2 150 2 160 14C168 23 178 21 198 8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
        whileInView={animate ? { pathLength: 1, opacity: 1 } : undefined}
        viewport={animate ? { once: true, amount: 0.8 } : undefined}
        transition={{ duration: 1, delay, ease: 'easeInOut' }}
      />
    </svg>
  );
}

/** A wavy full-width section divider that reads as a length of bent wire. */
export function WireDivider({ className = '', color = '#f0a7ba', flip = false }: { className?: string; color?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 40"
      fill="none"
      preserveAspectRatio="none"
      className={`h-8 w-full ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M0 20C50 4 100 4 150 20C200 36 250 36 300 20C350 4 400 4 450 20C500 36 550 36 600 20C650 4 700 4 750 20C800 36 850 36 900 20C950 4 1000 4 1050 20C1080 30 1140 34 1200 16"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
      />
    </svg>
  );
}
