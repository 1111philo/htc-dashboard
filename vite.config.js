import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { version } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        entryFileNames: `[name].${version}.js`,
        chunkFileNames: `[name].${version}.js`,
        assetFileNames: `[name].${version}.[ext]`,
      },
    },
  },
});
