import { defineConfig } from "vite";

// 本機測試頁（pnpm dev:page）：只服務 dev/ 目錄，不進任何 build 產物
export default defineConfig({
  root: __dirname,
  server: { port: 5175 },
});
