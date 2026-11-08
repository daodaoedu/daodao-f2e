import { BUG_REPORT_AREAS, type MyBugReport } from "@daodao/api";

/**
 * 「我的回報」畫面用的純邏輯（daodao#451 AC-08）
 */

/** 通知連結 ?report=<id> → 要捲到的回報 id；不是正整數回 null */
export function reportIdFromSearch(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/** 問題區域 i18n key；server 回未知值或 null 時回 null（畫面不顯示區域標籤） */
export function areaLabelKey(area: string | null): `bug_area_${string}` | null {
  return area && (BUG_REPORT_AREAS as readonly string[]).includes(area) ? `bug_area_${area}` : null;
}

/** 狀態 i18n key */
export function statusLabelKey(status: MyBugReport["status"]): `bug_mine_status_${string}` {
  return `bug_mine_status_${status}`;
}

/** 相關連結只在 http(s) 時給可點的 href，其他值只顯示文字 */
export function safeLinkHref(link: string | null): string | null {
  return link && /^https?:\/\//i.test(link) ? link : null;
}
