#!/usr/bin/env node
/**
 * 生成靜態環境變數配置檔案
 * 監聽 .env 檔案變化並自動生成靜態 TypeScript 檔案
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

const CONFIG_DIR = path.resolve(__dirname, "..");
const GENERATED_DIR = path.resolve(CONFIG_DIR, "generated");
const OUTPUT_FILE = path.resolve(GENERATED_DIR, "env.ts");

/**
 * 載入環境變數
 */
function loadEnvVars(): Record<string, string> {
  const envFiles = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(CONFIG_DIR, "../../.env.local"),
    path.resolve(CONFIG_DIR, "../../.env"),
    path.resolve(CONFIG_DIR, "../../apps/product/.env.local"),
    path.resolve(CONFIG_DIR, "../../apps/product/.env"),
    path.resolve(CONFIG_DIR, "../../apps/website/.env.local"),
    path.resolve(CONFIG_DIR, "../../apps/website/.env"),
  ];

  // 清除之前的環境變數（只保留系統環境變數）
  const originalEnv = { ...process.env };

  // 載入 .env 檔案
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      dotenv.config({ path: envFile, override: false });
    }
  }

  // 取得所有 NEXT_PUBLIC_* 環境變數
  const publicEnvVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      publicEnvVars[key] = value || "";
    }
  }

  // 恢復原始環境變數
  process.env = originalEnv;

  return publicEnvVars;
}

/**
 * 生成靜態環境變數檔案
 */
function generateStaticEnv() {
  const publicEnvVars = loadEnvVars();

  // 確保 generated 目錄存在
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const content = `/**
 * 自動生成的靜態環境變數配置
 * 此檔案由 scripts/generate-env.ts 自動生成
 * 請勿手動編輯
 * 
 * 生成時間: ${new Date().toISOString()}
 */

export const env = ${JSON.stringify(publicEnvVars, null, 2)} as const;

export type EnvKeys = keyof typeof env;
`;

  fs.writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(`✅ Generated static env config: ${OUTPUT_FILE}`);
  console.log(`   Found ${Object.keys(publicEnvVars).length} public environment variables`);
  if (Object.keys(publicEnvVars).length > 0) {
    console.log(`   Variables: ${Object.keys(publicEnvVars).join(", ")}`);
  }
}

// 執行生成
generateStaticEnv();

// 如果使用 watch 模式
if (process.argv.includes("--watch")) {
  const chokidar = require("chokidar");
  
  const watchPaths = [
    path.resolve(process.cwd(), ".env*"),
    path.resolve(CONFIG_DIR, "../../.env*"),
    path.resolve(CONFIG_DIR, "../../apps/product/.env*"),
    path.resolve(CONFIG_DIR, "../../apps/website/.env*"),
  ];

  console.log("\n👀 Watching for .env file changes...");
  
  const watcher = chokidar.watch(watchPaths, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("change", (filePath: string) => {
    console.log(`\n📝 Detected change in: ${filePath}`);
    generateStaticEnv();
  });

  watcher.on("add", (filePath: string) => {
    console.log(`\n➕ New .env file detected: ${filePath}`);
    generateStaticEnv();
  });
}

