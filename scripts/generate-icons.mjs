import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const input = "public/icon.svg";
const outputDir = "public/icons";

const sizes = [16, 32, 48, 128, 512];

await mkdir(outputDir, { recursive: true });

for (const size of sizes) {
  await sharp(input)
    .resize(size, size)
    .png()
    .toFile(path.join(outputDir, `icon-${size}.png`));

  console.log(`Generated icon-${size}.png`);
}
