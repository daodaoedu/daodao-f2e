import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * daodao#233 / #239 regression guard。
 *
 * `w-screen` 是 `100vw`：疊在有 padding 的父層（`(with-layout)` 的 `md:pl-[132px]`）上會讓整頁
 * 右偏並出現橫向捲軸，有垂直捲軸時也會多出捲軸寬。頁面 wrapper 一律用 `w-full`。
 *
 * 真的需要 100vw 的（例如全螢幕遮罩）登記在 ALLOWED，並寫明**該檔預期的出現次數**——
 * 只登記檔名會讓同一個檔案裡的頁面 wrapper 偷偷改回 `w-screen` 也不被發現。
 *
 * 範圍：只掃 `apps/product/src`。`apps/mobile`（React Native，無 Tailwind w-screen）不適用；
 * `apps/website` 與 `packages/ui` 目前乾淨但未納入本 guard，要一起防守時各自加一份。
 */
const ALLOWED: Array<{ file: string; count: number; reason: string }> = [];
// 目前 0 筆：22 處頁面 wrapper 已全部改為 w-full（daodao#239）

const SRC = path.resolve(__dirname, "..");
const SELF = path.relative(SRC, __filename);
// 前面不能是 `-` 或字元，否則 `max-w-screen`（合法的 Tailwind）會被誤判
const W_SCREEN = /(?<![-\w])w-screen\b/g;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "node_modules" ? [] : walk(full);
    return /\.(tsx|ts)$/.test(name) ? [full] : [];
  });

/** 檔案相對路徑 → 該檔 `w-screen` 的出現次數（只含有出現的檔案） */
const scan = (): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const file of walk(SRC)) {
    if (path.relative(SRC, file) === SELF) continue; // 只跳過 guard 自己，其他測試檔一樣要掃
    const hits = readFileSync(file, "utf8").match(W_SCREEN)?.length ?? 0;
    if (hits > 0) counts.set(path.relative(SRC, file), hits);
  }
  return counts;
};

describe("頁面 wrapper 不得使用 w-screen", () => {
  it("apps/product/src 內沒有未登記的 w-screen", () => {
    const allowed = new Set(ALLOWED.map((a) => a.file));
    const offenders = [...scan().keys()].filter((f) => !allowed.has(f)).sort();

    expect(offenders).toEqual([]);
  });

  it("已登記檔案的 w-screen 數量必須與登記值相符", () => {
    const counts = scan();
    const actual = ALLOWED.map((a) => ({ file: a.file, count: counts.get(a.file) ?? 0 }));
    const expected = ALLOWED.map((a) => ({ file: a.file, count: a.count }));

    // 數量變多 = 有新的 w-screen 混進已豁免的檔案；變少 = 登記過期，請更新
    expect(actual).toEqual(expected);
  });

  it("登記清單每一筆都要有理由", () => {
    for (const entry of ALLOWED) {
      expect(entry.reason.trim().length).toBeGreaterThan(0);
    }
  });
});
