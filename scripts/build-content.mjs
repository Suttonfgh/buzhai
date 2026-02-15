import { build } from "esbuild";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(rootDir, "..");

await build({
  entryPoints: [resolve(projectRoot, "src/content-scripts/content.ts")],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  outfile: resolve(projectRoot, "dist/assets/content-iife.js")
});
