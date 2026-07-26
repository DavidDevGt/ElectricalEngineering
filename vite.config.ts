import { defineConfig } from "vite";
import { markdownPlugin } from "./vite-plugin-markdown.ts";

export default defineConfig({
  root: ".",
  plugins: [markdownPlugin()],
  server: {
    host: "0.0.0.0",
    port: 8005,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
