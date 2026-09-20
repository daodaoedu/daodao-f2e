import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * daodao#233 / #239 regression guard。
 *
 * `w-screen` 是 `100vw`：疊在有 padding 的父層（`(with-layout)` 的 `md:pl-[132px]`）上會讓整頁
 * 右偏並出現橫向捲軸，有垂直捲軸時也會多出捲軸寬。頁面 wrapper 一律用 `w-full`。
 * 真的需要 100vw 的（例如全螢幕遮罩）請在此清單登記並附理由。
 */
const ALLOWED: Array<{ file: string; reason: string }> = [];
// 目前 0 筆：22 處頁面 wrapper 已全部改為 w-full（daodao#239）

const SRC = path.resolve(__dirname, "..");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "node_modules" ? [] : walk(full);
    return /\.(tsx|ts)$/.test(name) ? [full] : [];
  });

describe("頁面 wrapper 不得使用 w-screen", () => {
  it("apps/product/src 內沒有未登記的 w-screen", () => {
    const offenders = walk(SRC)
      .filter((f) => !f.includes(`${path.sep}__tests__${path.sep}`))
      .filter((f) => /\bw-screen\b/.test(readFileSync(f, "utf8")))
      .map((f) => path.relative(SRC, f))
      .filter((rel) => !ALLOWED.some((a) => a.file === rel));

    expect(offenders).toEqual([]);
  });

  it("登記清單每一筆都要有理由", () => {
    for (const entry of ALLOWED) {
      expect(entry.reason.trim().length).toBeGreaterThan(0);
    }
  });
});
