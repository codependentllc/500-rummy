import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

const assetDirs = ["avatars", "backgrounds"];

for (const dir of assetDirs) {
  const sourceDir = join(root, "src", "assets", dir);
  const publicDir = join(root, "public", dir);

  mkdirSync(publicDir, { recursive: true });

  for (const file of readdirSync(sourceDir)) {
    if (!imageExtensions.has(extname(file).toLowerCase())) continue;

    copyFileSync(join(sourceDir, file), join(publicDir, file));
  }
}
