import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * daodao#214 regression guard。
 *
 * 手刻浮層（`<div role="menu" className="absolute ...">`）渲染在觸發按鈕的 DOM 裡，任何祖先只要是
 * `overflow-hidden`（例如 desktop sidebar 為了收合動畫）就會把浮層裁掉；祖先的 stacking context
 * 也會讓它被其他區塊蓋住。選單／下拉／浮動面板一律用有 Portal 的 `@daodao/ui` 元件
 * （`Popover`、`Dialog` 等 radix 包裝），role 掛在元件上（`<PopoverContent role="menu">`）。
 *
 * 判定：原生元素（小寫 tag，含 `motion.div`）帶 `role="menu" | "listbox" | "dialog"` = 手刻浮層。
 * 掛在大寫元件上的不算——那是 primitive 的責任。
 * 注意：`@daodao/ui` 的 `DropdownMenu` 目前也不是 Portal 實作，在 overflow 祖先內一樣會被裁，
 * 改用 `Popover` 直到它換成 radix 版本。
 *
 * 真的不需要 Portal 的（例如本身就是 `fixed` 的全螢幕層）登記在 ALLOWED，並寫明該檔預期的出現次數。
 */
const ALLOWED: Array<{ file: string; count: number; reason: string }> = [
  {
    file: "components/dashboard/add-task-fab.tsx",
    count: 1,
    reason: "選單掛在 fixed 的 FAB 容器內、祖先無 overflow 裁切；待遷移 Popover",
  },
  {
    file: "components/spaces/space-fab.tsx",
    count: 1,
    reason: "選單掛在 fixed 的 FAB 容器內、祖先無 overflow 裁切；待遷移 Popover",
  },
  {
    file: "components/layout/sidebar/mobile-bottom-sheet.tsx",
    count: 1,
    reason: "本身是 fixed inset-0 的全螢幕 bottom sheet，不會被祖先裁切",
  },
  {
    file: "components/island/island-owner-panel.tsx",
    count: 1,
    reason: "島嶼畫布內的非 modal 側板，刻意定位在畫布範圍內",
  },
  {
    file: "components/island/practice-camp-card.tsx",
    count: 1,
    reason: "島嶼畫布內的非 modal 卡片，刻意定位在畫布範圍內",
  },
];

const SRC = path.resolve(__dirname, "..");
const SELF = path.relative(SRC, __filename);
// 小寫開頭的 JSX tag（div / ul / motion.div…）到同一個 opening tag 內的 role 屬性；`[^<]` 不跨到下一個 tag
const HAND_ROLLED = /<[a-z][\w.]*\b[^<]*?\brole=["'](menu|listbox|dialog)["']/g;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return name === "node_modules" ? [] : walk(full);
    return /\.tsx$/.test(name) ? [full] : [];
  });

const countHandRolled = (source: string): number => source.match(HAND_ROLLED)?.length ?? 0;

/** 檔案相對路徑 → 手刻浮層出現次數（只含有出現的檔案） */
const scan = (): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const file of walk(SRC)) {
    if (path.relative(SRC, file) === SELF) continue;
    const hits = countHandRolled(readFileSync(file, "utf8"));
    if (hits > 0) counts.set(path.relative(SRC, file), hits);
  }
  return counts;
};

describe("判定規則", () => {
  it("原生元素帶 role=menu／listbox／dialog 算手刻浮層", () => {
    expect(countHandRolled(`<div\n  className="absolute bottom-full"\n  role="menu"\n>`)).toBe(1);
    expect(countHandRolled(`<ul role="listbox">`)).toBe(1);
    expect(countHandRolled(`<motion.aside\n  role="dialog"\n  onClick={() => close()}\n>`)).toBe(1);
  });

  it("role 掛在大寫元件（Portal primitive）上不算", () => {
    expect(countHandRolled(`<PopoverContent side="top" role="menu">`)).toBe(0);
    expect(countHandRolled(`<div className="py-1"><PopoverContent role="menu">`)).toBe(0);
  });

  it("role=menuitem 等其他 role 不算", () => {
    expect(countHandRolled(`<button role="menuitem">`)).toBe(0);
    expect(countHandRolled(`<div role="menubar">`)).toBe(0);
  });
});

describe("選單／下拉／浮動面板不得手刻（必須走 Portal）", () => {
  it("apps/product/src 內沒有未登記的手刻浮層", () => {
    const allowed = new Set(ALLOWED.map((a) => a.file));
    const offenders = [...scan().keys()].filter((f) => !allowed.has(f)).sort();

    expect(offenders).toEqual([]);
  });

  it("已登記檔案的手刻浮層數量必須與登記值相符", () => {
    const counts = scan();
    const actual = ALLOWED.map((a) => ({ file: a.file, count: counts.get(a.file) ?? 0 }));
    const expected = ALLOWED.map((a) => ({ file: a.file, count: a.count }));

    // 數量變多 = 已豁免檔案又混進新的手刻浮層；變少 = 已遷移，請把登記移除
    expect(actual).toEqual(expected);
  });

  it("登記清單每一筆都要有理由", () => {
    for (const entry of ALLOWED) {
      expect(entry.reason.trim().length).toBeGreaterThan(0);
    }
  });
});
