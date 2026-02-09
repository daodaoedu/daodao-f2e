/**
 * 將 Web design tokens 轉換為 Mobile 格式
 *
 * 主要轉換：
 * - 確保色彩為 hex 格式（React Native 不支援 oklch）
 * - 生成 TypeScript 檔案供 Tamagui 使用
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { colors, radius, spacing, typography } from "../src";

const OUTPUT_DIR = path.resolve(__dirname, "../../../apps/mobile/generated/design-tokens");

function generateMobileTokens() {
  // 確保輸出目錄存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 生成 colors.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "colors.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens
// 生成時間: ${new Date().toISOString()}

export const colors = ${JSON.stringify(colors, null, 2)} as const

export type Colors = typeof colors
`
  );

  // 生成 spacing.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "spacing.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens
// 生成時間: ${new Date().toISOString()}

export const spacing = ${JSON.stringify(spacing, null, 2)} as const

export type Spacing = typeof spacing
`
  );

  // 生成 typography.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "typography.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens
// 生成時間: ${new Date().toISOString()}

export const typography = ${JSON.stringify(typography, null, 2)} as const

export type Typography = typeof typography
`
  );

  // 生成 radius.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "radius.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens
// 生成時間: ${new Date().toISOString()}

export const radius = ${JSON.stringify(radius, null, 2)} as const

export type Radius = typeof radius
`
  );

  // 生成 index.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "index.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens
// 生成時間: ${new Date().toISOString()}

export * from './colors'
export * from './spacing'
export * from './typography'
export * from './radius'
`
  );

  console.log("✅ Mobile design tokens generated at:", OUTPUT_DIR);
}

generateMobileTokens();
