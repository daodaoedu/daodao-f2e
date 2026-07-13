/**
 * 將 Web design tokens 轉換為 Mobile 格式
 *
 * 主要轉換：
 * - 確保色彩為 hex 格式（React Native 不支援 oklch）
 * - 生成 TypeScript 檔案供 Tamagui 使用
 *
 * 生成前會先驗證：src/colors.ts 中「有 CSS 對應」的 token 必須與
 * packages/ui/src/styles/globals.css 的 oklch 等價（見 CSS_TOKEN_MAP）。
 * 任一邊漂移就中止 build，以此斷開過去靠人肉手抄而悄悄走鐘的環節。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { colors, radius, spacing, typography } from "../src";
import { hexDistance, oklchToHex } from "./lib/color";

const OUTPUT_DIR = path.resolve(__dirname, "../../../apps/mobile/generated/design-tokens");
const GLOBALS_CSS = path.resolve(__dirname, "../../ui/src/styles/globals.css");

/**
 * token 路徑 → globals.css 變數名（去掉 `--`）。
 * 只列語意上 1:1 明確對應者；quiz/practice/basic.50/border.lightCyan
 * 等 mobile 專屬 token 不在此，不驗證。
 */
const CSS_TOKEN_MAP: Record<string, string> = {
  "primary.palest": "primary-palest",
  "primary.pale": "primary-pale",
  "primary.lightest": "primary-lightest",
  "primary.lighter": "primary-lighter",
  "primary.base": "primary-base",
  "primary.darker": "primary-darker",
  "gray.dark": "bg-dark",
  "gray.mid": "light-gray",
  "gray.light": "bg-gray",
  "gray.veryLight": "very-light-gray",
  "gray.white": "white",
  "mascot.aqua": "mascot-aqua",
  "mascot.brightBlue": "mascot-bright-blue",
  "logo.gray": "logo-gray",
  "logo.cyan": "logo-cyan",
  "logo.orange": "logo-orange",
  "logo.yellow": "logo-yellow",
  "background.light": "white",
  "background.dark": "bg-dark",
  "background.gray": "bg-gray",
  "background.veryLightGray": "very-light-gray",
  "background.veryLightBlue": "very-light-blue",
  "background.lightCyan": "light-cyan",
  "text.dark": "text-dark",
  "text.light": "white",
  "text.muted": "light-gray",
  "border.light": "border",
  "border.white": "white",
  "basic.100": "basic-100",
  "basic.200": "basic-200",
  "basic.300": "basic-300",
  "basic.400": "basic-400",
  "basic.500": "basic-500",
  "basic.600": "basic-600",
  "basic.white": "basic-white",
  "basic.black": "basic-black",
  "semantic.success": "success",
  "semantic.tips": "tips",
};

// CSS 只寫 3 位小數的 oklch，round-trip 回 hex 可能差 1~2；真漂移一律 >= 3
const DRIFT_TOLERANCE = 2;

/** 解析 globals.css `:root` 的 oklch 變數為 hex，並解一層 var() alias。 */
function parseGlobalsCss(): Record<string, string> {
  const css = fs.readFileSync(GLOBALS_CSS, "utf8");
  const root = css.slice(css.indexOf(":root"), css.indexOf("}", css.indexOf(":root")));
  const raw: Record<string, string> = {};
  for (const m of root.matchAll(/--([a-zA-Z0-9-]+):\s*([^;]+);/g)) raw[m[1]] = m[2].trim();

  const hex: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const o = /^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)$/.exec(v);
    if (o) hex[k] = oklchToHex({ l: +o[1], c: +o[2], h: +o[3] });
  }
  for (const [k, v] of Object.entries(raw)) {
    const a = /^var\(--([a-zA-Z0-9-]+)\)$/.exec(v);
    if (a && hex[a[1]]) hex[k] = hex[a[1]];
  }
  return hex;
}

function getTokenHex(dotPath: string): string | undefined {
  return dotPath
    .split(".")
    .reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], colors) as
    | string
    | undefined;
}

/** 驗證 token 與 globals.css 等價；漂移就印出對照並中止。 */
function verifyColorsAgainstCss(): void {
  const cssHex = parseGlobalsCss();
  const drifts: string[] = [];

  for (const [tokenPath, cssVar] of Object.entries(CSS_TOKEN_MAP)) {
    const token = getTokenHex(tokenPath);
    const css = cssHex[cssVar];
    if (!token) {
      drifts.push(`  ${tokenPath.padEnd(26)} colors.ts 查無此 token`);
      continue;
    }
    if (!css) {
      drifts.push(`  ${tokenPath.padEnd(26)} globals.css 查無 --${cssVar}`);
      continue;
    }
    const d = hexDistance(token, css);
    if (d > DRIFT_TOLERANCE) {
      drifts.push(
        `  ${tokenPath.padEnd(26)} token=${token}  css(--${cssVar})=${css}  色差=${d.toFixed(1)}`
      );
    }
  }

  if (drifts.length > 0) {
    console.error(
      `\n❌ design-tokens 與 globals.css 不同步（${drifts.length} 項漂移）：\n${drifts.join("\n")}\n\n` +
        `請對齊 src/colors.ts 與 packages/ui/src/styles/globals.css 後重試。\n`
    );
    process.exit(1);
  }

  console.log(`✅ 色票驗證通過：${Object.keys(CSS_TOKEN_MAP).length} 個 token 與 globals.css 一致`);
}

function generateMobileTokens() {
  verifyColorsAgainstCss();

  // 確保輸出目錄存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 生成 colors.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "colors.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens

export const colors = ${JSON.stringify(colors, null, 2)} as const

export type Colors = typeof colors
`
  );

  // 生成 spacing.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "spacing.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens

export const spacing = ${JSON.stringify(spacing, null, 2)} as const

export type Spacing = typeof spacing
`
  );

  // 生成 typography.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "typography.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens

export const typography = ${JSON.stringify(typography, null, 2)} as const

export type Typography = typeof typography
`
  );

  // 生成 radius.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "radius.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens

export const radius = ${JSON.stringify(radius, null, 2)} as const

export type Radius = typeof radius
`
  );

  // 生成 index.ts
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "index.ts"),
    `// 自動生成，請勿手動修改
// 來源: packages/design-tokens

export * from './colors'
export * from './spacing'
export * from './typography'
export * from './radius'
`
  );

  console.log("✅ Mobile design tokens generated at:", OUTPUT_DIR);
}

generateMobileTokens();
