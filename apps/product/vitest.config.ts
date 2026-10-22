import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfig 的 jsx: "preserve" 是給 Next 用的；測試要在 node 直接跑 .tsx 元件，須自行轉 JSX
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts", "src/**/__tests__/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
