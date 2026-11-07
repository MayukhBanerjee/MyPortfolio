/**
 * Turns originals in /photos into web-ready files in /public/images.
 * Run: npm run photos
 *
 * hero-cutout.png -> hero-cutout.webp (B&W portrait, transparent background)
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
  // hero-cutout.png is the portrait with the background removed (transparent PNG)
  const src = join(SRC, "hero-cutout.png");
  if (!existsSync(src)) return;
  const resized = await sharp(src).resize({ height: 1800, withoutEnlargement: true }).png().toBuffer();
  const alpha = await sharp(resized).extractChannel(3).toBuffer();
  const grey = await sharp(resized).removeAlpha().grayscale().linear(1.12, -10).toBuffer();
  await sharp(grey)
    .joinChannel(alpha)
    .webp({ quality: 84, alphaQuality: 90 })
    .toFile(join(OUT, "hero-cutout.webp"));
  done.push("hero-cutout.webp");
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
