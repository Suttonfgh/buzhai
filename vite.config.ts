import { defineConfig } from "vite";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "service-worker": resolve(rootDir, "src/background/service-worker.ts"),
        content: resolve(rootDir, "src/content-scripts/content.ts"),
        popup: resolve(rootDir, "src/ui/popup/index.html"),
        sidebar: resolve(rootDir, "src/ui/sidebar/index.html"),
        settings: resolve(rootDir, "src/ui/settings/index.html"),
        history: resolve(rootDir, "src/ui/history/index.html"),
        about: resolve(rootDir, "src/ui/about/index.html"),
        onboarding: resolve(rootDir, "src/ui/onboarding/index.html")
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]"
      }
    }
  }
});
