import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", ".next"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      reporter: ["text", "json", "html"],
      // TODO: Add thresholds when we have more tests
      // thresholds: {
      //   statements: 80,
      //   branches: 80,
      //   functions: 80,
      //   lines: 80,
      // },
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "coverage/**",
        "dist/**",
        ".next/**",
      ],
    },
    reporters: ["json", "verbose"],
    outputFile: "./test-results.json",
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
