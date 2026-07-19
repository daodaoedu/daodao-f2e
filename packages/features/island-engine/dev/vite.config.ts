import { resolve } from "node:path";
import { defineConfig } from "vite";

// 本機測試頁（pnpm dev:page）：只服務 dev/ 目錄，不進任何 build 產物
// publicDir 指向 packages/assets，讓 /models/island/*.glb 與正式站同路徑
export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, "../../../assets"),
  server: { port: 5175 },
});
