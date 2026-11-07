/**
 * Turns originals in /photos into web-ready files in /public/images.
 * Run: npm run photos
 *
 * hero.jpg  -> hero-mask.jpg  (B&W, shadows lifted so letters never vanish into the night sky)
 *           -> hero-full.jpg  (B&W, deep contrast, for the full frame at the end of the scroll dive)
 * football.jpg -> football.jpg (B&W, resized)
 * diary.jpg    -> diary.jpg    (resized, colour kept)
 */
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "photos";
const OUT = join("public", "images");
mkdirSync(OUT, { recursive: true });

const jpeg = { quality: 80, mozjpeg: true, progressive: true };
const done = [];

async function hero() {
  const src = join(SRC, "hero.jpg");
  if (!existsSync(src)) return;
  // two passes: sharp applies normalise late in its pipeline, which would undo the lift below
  const grey = await sharp(src)
    .rotate()
    .resize({ width: 2400, withoutEnlargement: true })
    .grayscale()
    .normalise()
    .toColourspace("b-w")
    .png()
    .toBuffer();
  const base = () => sharp(grey);

  // inside the letters: lift the blacks to ~#3c3c3c so every letter stays readable on the black page
  await base().linear(0.76, 60).sharpen({ sigma: 0.6 }).jpeg(jpeg).toFile(join(OUT, "hero-mask.jpg"));
  // the full frame: deeper, more graphic
  await base().linear(1.18, -14).sharpen({ sigma: 0.6 }).jpeg(jpeg).toFile(join(OUT, "hero-full.jpg"));
  done.push("hero-mask.jpg", "hero-full.jpg");
}

async function simple(name, { grey, width }) {
  const src = join(SRC, name);
  if (!existsSync(src)) return;
  let img = sharp(src).rotate().resize({ width, withoutEnlargement: true });
  if (grey) img = img.grayscale().normalise().linear(1.1, -8);
  await img.jpeg(jpeg).toFile(join(OUT, name));
  done.push(name);
}

await hero();
await simple("football.jpg", { grey: true, width: 2000 });
await simple("diary.jpg", { grey: false, width: 1600 });

console.log(done.length ? `wrote: ${done.join(", ")}` : "no originals found in /photos");
