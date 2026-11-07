/**
 * Turns originals in /photos into web-ready files in /public/images.
 * Run: npm run photos
 *
 * hero.jpg     -> hero-portrait.webp (B&W, background kept, cropped to head and torso)
 * hello.jpg    -> hello-portrait.webp (COLOUR, cropped to the arch)
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

async function hello() {
  // the smiling one: full COLOUR, head to crossed arms, cropped to the arch (0.72)
  const src = join(SRC, "hello.jpg");
  if (!existsSync(src)) return;
  const { width: W0, height: H0, orientation } = await sharp(src).metadata();
  const [W, H] = orientation && orientation >= 5 ? [H0, W0] : [W0, H0];
  const cw = Math.round(W * 0.74);
  const ch = Math.min(H, Math.round(cw / 0.72));
  const left = Math.round(W * 0.11);
  const top = H - ch;
  await sharp(src)
    .rotate()
    .extract({ left, top, width: cw, height: ch })
    .resize({ width: 1400 })
    .modulate({ saturation: 1.04, brightness: 1.0 })
    .linear(1.05, -4)
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 86 })
    .toFile(join(OUT, "hello-portrait.webp"));
  done.push("hello-portrait.webp");
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
await hello();
await simple("football.jpg", { grey: true, width: 2000 });
await simple("diary.jpg", { grey: false, width: 1600 });

console.log(done.length ? `wrote: ${done.join(", ")}` : "no originals found in /photos");
