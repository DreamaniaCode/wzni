import sharp from "sharp";
import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
const sources = [
  {
    name: "silver",
    file: "WhatsApp Image 2026-10-08 at 12.25.22222.jpeg",
    points: "42,302 253,51 298,64 648,149 646,160 498,455 43,310",
    crop: { left: 35, top: 45, width: 620, height: 414 },
  },
  {
    name: "led",
    file: "WhatsApp Image 2026-10-08 at 12.25.22555.jpeg",
    points:
      "94,281 99,264 270,79 291,72 607,155 623,169 620,187 453,412 429,423 97,293",
    crop: { left: 85, top: 65, width: 545, height: 365 },
  },
  {
    name: "black",
    file: "WhatsApp Image 2026-10-08 at 12.25.22.jpeg",
    points: "41,331 254,50 648,149 645,161 498,455 43,340",
    crop: { left: 35, top: 43, width: 620, height: 416 },
  },
];
await mkdir("public/products/originals", { recursive: true });
await mkdir("public/products/optimized", { recursive: true });
const report = [];
for (const source of sources) {
  const input = path.join(
    process.argv[2] || "C:/Users/admin/Downloads",
    source.file,
  );
  const original = `public/products/originals/prima-${source.name}.jpg`;
  await copyFile(input, original);
  const meta = await sharp(input).metadata();
  const mask = Buffer.from(
    `<svg width="${meta.width}" height="${meta.height}"><polygon points="${source.points}" fill="white"/></svg>`,
  );
  const cleaned = await sharp(input)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  const cropped = await sharp(cleaned)
    .extract(source.crop)
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
  await sharp(cropped)
    .jpeg({ quality: 94 })
    .toFile(`public/products/prima-${source.name}.jpg`);
  await sharp(cropped)
    .webp({ quality: 92 })
    .toFile(`public/products/optimized/prima-${source.name}.webp`);
  await sharp(cropped)
    .resize({ width: 360, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(`public/products/optimized/prima-${source.name}-small.webp`);
  report.push({
    sku: `CB301-${source.name.toUpperCase()}`,
    dimensions: [meta.width, meta.height],
    technique:
      "Hand-traced polygon mask outside physical product; white background; crop; no regenerated pixels",
    review: "Requires visual edge and label review",
    original,
    output: `public/products/optimized/prima-${source.name}.webp`,
  });
}
await writeFile(
  "scripts/image-processing-report.json",
  JSON.stringify(report, null, 2),
);
