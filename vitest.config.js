import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globalSetup: "./vitest.globalSetup.js",
    setupFiles: ["./vitest.setup.js"],
    globals: true,
    include: ["src/**/*.test.tsx", "src/**/*.test.ts"],
  },
  compilerOptions: {
    types: ["vitest/globals"],
  },
});
