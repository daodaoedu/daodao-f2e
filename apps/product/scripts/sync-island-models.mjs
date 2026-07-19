/**
 * 把 packages/assets/models/island 的 GLB 同步到 public/models/island
 * （single source of truth 在 packages/assets；public 副本不進 git）
 * 由 predev / prebuild 自動執行
 */
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../../packages/assets/models/island");
const target = resolve(here, "../public/models/island");

if (!existsSync(source)) {
  console.warn("[island-models] 來源不存在，略過（跑 scripts/island-models/build.sh 產生素材）");
  process.exit(0);
}

mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log("[island-models] synced → public/models/island");
