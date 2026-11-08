// Builds the site icon (MB monogram) into app/: icon.svg, icon.png,
// apple-icon.png and favicon.ico. Run: npm run icons
// Heavy M (like MAYUKH, Archivo 900) shares its right stem with a thin B
// (like BANERJEE, Archivo 200). Black and paper only: teal is reserved.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const BLACK = "#000000";
const PAPER = "#f0ede8";

const M =
  "M8 17H17.6L22 33L26.4 17H36V47H29.6V28.5L24.5 44.5H19.5L14.4 28.5V47H8Z";
const B =
  "M34 19.25H43A6.125 6.125 0 0 1 43 31.5H34M34 31.5H44A6.625 6.625 0 0 1 44 44.75H34";

const svg = (rx = 14) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rx}" fill="${BLACK}"/>
  <g transform="translate(32 32) scale(1.14) translate(-29.3 -32)" fill="none">
    <path d="${M}" fill="${PAPER}"/>
    <path d="${B}" stroke="${PAPER}" stroke-width="4.5"/>
  </g>
</svg>
`;

const out = (p) => new URL(`../app/${p}`, import.meta.url);
const png = (s, size) => sharp(Buffer.from(s), { density: 72 * (size / 64) * 4 })
  .resize(size, size).png().toBuffer();

writeFileSync(out("icon.svg"), svg());
writeFileSync(out("icon.png"), await png(svg(), 512));
// iOS rounds the corners itself, so the apple icon is a full square.
writeFileSync(out("apple-icon.png"), await png(svg(0), 180));

// favicon.ico holding 16, 32 and 48 px PNGs.
const sizes = [16, 32, 48];
const imgs = await Promise.all(sizes.map((s) => png(svg(), s)));
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  head.writeUInt8(s, e); head.writeUInt8(s, e + 1);
  head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(imgs[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
  offset += imgs[i].length;
});
writeFileSync(out("favicon.ico"), Buffer.concat([head, ...imgs]));
console.log("icons written to app/");
