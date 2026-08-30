// Responsive image helpers.
//
// scripts/gen-thumbs.mjs writes derivatives to public/images/w{400,800,1200}/
// and records which widths exist for each source in derivatives.json (an
// image is never upscaled, so a small original has fewer derivatives).
import derivatives from './derivatives.json';

const webp = (file) => file.replace(/\.(jpe?g|png|webp)$/i, '.webp');

/** Widest available derivative — the src fallback for browsers ignoring srcset. */
export function thumb(src, preferred = 800) {
  const file = src.split('/').pop();
  const widths = derivatives[file];
  if (!widths || !widths.length) return src;
  const w = widths.includes(preferred) ? preferred : widths[widths.length - 1];
  return `/images/w${w}/${webp(file)}`;
}

/** srcset across every generated width; empty string when none exist. */
export function srcset(src) {
  const file = src.split('/').pop();
  const widths = derivatives[file];
  if (!widths || !widths.length) return undefined;
  return widths.map((w) => `/images/w${w}/${webp(file)} ${w}w`).join(', ');
}
