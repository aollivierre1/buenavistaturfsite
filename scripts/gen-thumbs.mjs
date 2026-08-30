// Generates responsive derivatives for the photo grids.
//
// The library is full-resolution (up to 1800px wide) but the grids render at
// 288px desktop / 157px mobile. Shipping the originals meant a ~16MB page.
// Runs automatically via the `prebuild` npm script; output is gitignored and
// regenerated on every deploy. Existing files are skipped, so reruns are cheap.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'public/images';
const WIDTHS = [400, 800, 1200];
const QUALITY = 72;

// Only the photos that appear in a grid; the logo and icons stay as-is.
const inGrid = (f) => /^\d{3}-/.test(f)
  || /^(Mike|Luisa|Alfredo|Jason|Holly|Gwen|Bervin|Shawn|marty)/i.test(f)
  || /^(IVO\d|BuenaVista-irrigation|Trl-)/i.test(f);

const files = fs.readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && inGrid(f));

let made = 0, skipped = 0, saved = 0, origTotal = 0;
const manifest = {};

for (const f of files) {
  const src = path.join(SRC, f);
  const meta = await sharp(src).metadata();
  origTotal += fs.statSync(src).size;

  manifest[f] = [];
  for (const w of WIDTHS) {
    // Never upscale.
    if (meta.width && meta.width < w) continue;
    manifest[f].push(w);
    const outDir = path.join(SRC, `w${w}`);
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, f.replace(/\.(jpe?g|png|webp)$/i, '.webp'));
    if (fs.existsSync(out)) { skipped++; continue; }
    await sharp(src).resize(w).webp({ quality: QUALITY }).toFile(out);
    made++;
  }
  // smallest derivative is what the grid actually ships
  const small = path.join(SRC, 'w400', f.replace(/\.(jpe?g|png|webp)$/i, '.webp'));
  if (fs.existsSync(small)) saved += fs.statSync(src).size - fs.statSync(small).size;
}

fs.writeFileSync("src/data/derivatives.json", JSON.stringify(manifest, null, 0));
console.log(`[thumbs] ${files.length} sources | generated ${made}, skipped ${skipped}`);
console.log(`[thumbs] originals ${(origTotal / 1048576).toFixed(1)}MB -> 400w set saves ~${(saved / 1048576).toFixed(1)}MB`);
