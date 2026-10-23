import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { parse } from "@formatjs/icu-messageformat-parser";
import { describe, expect, it } from "vitest";

/**
 * locale 字串必須是合法 ICU MessageFormat（daodao#311）。
 *
 * next-intl 用 ICU 格式，佔位符寫 `{count}`。寫成 i18next 風格 `{{count}}`、`{count` 沒閉合、
 * plural 缺 `other` 時，typecheck／lint 都會過，執行時才丟 `IntlError: INVALID_MESSAGE`，
 * 畫面 fallback 成 `namespace.key`（#273 驗證時的「已連結 {{count}} 個」）。
 *
 * 跟 locale-key-parity 同一套：parity 管兩語系 key 集合一致，這裡管每個字串本身能被 parse。
 * 用 next-intl 底層同一個 parser（@formatjs/icu-messageformat-parser）逐字串 parse，
 * rich text 標籤（`<b>...</b>`）依 next-intl 預設視為合法。
 */

const LOCALES_DIR = resolve(__dirname, "../../../../packages/i18n/src/locales");
const REPO_ROOT = resolve(__dirname, "../../../..");

const DOUBLE_BRACE = /\{\{[^{}]*\}\}/;

/** 回傳字串的格式問題；合法時回傳 null */
const findIcuProblem = (message: string): string | null => {
  const doubleBrace = message.match(DOUBLE_BRACE);
  if (doubleBrace) {
    return `含 i18next 風格雙大括號 ${doubleBrace[0]}，next-intl 要寫成單大括號（例：{count}）`;
  }
  try {
    parse(message, { requiresOtherClause: true });
    return null;
  } catch (error) {
    return `ICU 語法錯誤：${error instanceof Error ? error.message : String(error)}`;
  }
};

interface LocaleString {
  file: string;
  key: string;
  value: string;
}

const collectStrings = (value: unknown, file: string, prefix: string): LocaleString[] => {
  if (typeof value === "string") return [{ file, key: prefix, value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, file, `${prefix}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      collectStrings(child, file, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
};

const listLocaleStrings = (): LocaleString[] =>
  readdirSync(LOCALES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((locale) => {
      const dir = join(LOCALES_DIR, locale.name);
      return readdirSync(dir)
        .filter((name) => name.endsWith(".json"))
        .flatMap((name) => {
          const path = join(dir, name);
          const json: unknown = JSON.parse(readFileSync(path, "utf8"));
          return collectStrings(json, relative(REPO_ROOT, path), "");
        });
    });

describe("findIcuProblem", () => {
  it.each([
    "已連結 {count} 個",
    "Hi {name}, welcome",
    "{count, plural, =0 {沒有} one {# 個} other {# 個}}",
    "{gender, select, male {他} female {她} other {他們}}",
    "請閱讀<link>服務條款</link>後繼續",
    "Don't worry, it's fine",
  ])("合法字串不報錯：%s", (message) => {
    expect(findIcuProblem(message)).toBeNull();
  });

  it("{{count}} 雙大括號會失敗並說明原因", () => {
    expect(findIcuProblem("已連結 {{count}} 個")).toMatch(/雙大括號 \{\{count\}\}/);
  });

  it.each([
    ["佔位符沒閉合", "已連結 {count 個"],
    ["plural 缺 other", "{count, plural, one {# 個}}"],
    ["select 缺 other", "{role, select, admin {管理員}}"],
    ["標籤沒閉合", "請閱讀<link>服務條款"],
  ])("ICU 語法錯誤會失敗：%s", (_label, message) => {
    expect(findIcuProblem(message)).toMatch(/^ICU 語法錯誤/);
  });
});

describe("locale ICU format", () => {
  const strings = listLocaleStrings();

  it("掃到 locale 字串", () => {
    expect(strings.length).toBeGreaterThan(100);
  });

  it("每個 locale 字串都是合法 ICU，且沒有 {{...}}", () => {
    const problems = strings.flatMap(({ file, key, value }) => {
      const problem = findIcuProblem(value);
      return problem ? [`${file} ${key}: ${problem}（原文：${JSON.stringify(value)}）`] : [];
    });
    expect(problems).toEqual([]);
  });
});
