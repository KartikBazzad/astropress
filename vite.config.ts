import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  esbuild: {
    minifyWhitespace: true,
    treeShaking: true,
  },
  build: {
    minify: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "astropress",
      fileName: "astropress",
    },
  },
  plugins: [dts()],
});
