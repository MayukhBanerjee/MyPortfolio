/**
 * Turns originals in /photos into web-ready files in /public/images.
 * Run: npm run photos
 *
 * hero.jpg     -> hero-portrait.webp (B&W, background kept, cropped to head and torso)
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
  // full photo, background kept, cropped to head and torso, black and white
  const src = join(SRC, "hero.jpg");
  if (!existsSync(src)) return;
  const grey = await sharp(src)
    .rotate()
    .extract({ left: 420, top: 980, width: 2240, height: 3180 })
    .resize({ width: 1400 })
    .grayscale()
    .normalise()
    .toColourspace("b-w")
    .png()
    .toBuffer();
  await sharp(grey)
    .linear(1.08, -6)
    .sharpen({ sigma: 0.7 })
    .webp({ quality: 84 })
    .toFile(join(OUT, "hero-portrait.webp"));
  done.push("hero-portrait.webp");
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
