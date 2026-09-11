/**
 * 模板庫（FRD frd-templates-org-archive.md §3.1）的純函式：命名推導、資源名稱推論、URL 正規化、
 * 每週頻率解析、搜尋比對、已開始判定。與 UI 分離以便單元測試。
 */

export const TEMPLATE_TITLE_MAX = 20;
export const TEMPLATE_ACTION_MAX = 50;
export const TEMPLATE_DAYS_MAX = 90;
export const TEMPLATE_MINUTES_MAX = 240;
export const TEMPLATE_TIMING_OTHER_MAX = 20;
export const TEMPLATE_RESOURCES_MAX = 5;
export const TEMPLATE_TAGS_MAX = 10;
export const DURATION_QUICK_OPTIONS = [7, 14, 21, 30] as const;
export const FREQUENCY_QUICK_OPTIONS = ["1-3", "3-5", "5-7"] as const;
export const MINUTES_QUICK_OPTIONS = [15, 30, 45, 60] as const;
export const TIMING_OPTIONS = ["morning", "commute", "afternoon", "evening", "night"] as const;
export type TemplateTiming = (typeof TIMING_OPTIONS)[number];

const TIME_WORD = /^(每天|每日|每週|每周|每月|早上|中午|下午|晚上|睡前|週末|平日|通勤時)/;

/**
 * 由實踐行動推導模板名稱（原型 deriveTemplateName）：
 * 以標點切段，第一段若是時間詞（每天、早上…）或太短，改取最長的非時間段；截到 20 字。
 */
export function deriveTemplateName(action: string): string {
  const segments = action
    .split(/[，,。；;、\n]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length === 0) return "";
  let picked = segments[0] ?? "";
  if (picked.length <= 10 && TIME_WORD.test(picked)) {
    const candidates = segments.filter((segment) => !TIME_WORD.test(segment));
    const longest = candidates.sort((a, b) => b.length - a.length)[0];
    if (longest) picked = longest;
  }
  return picked.slice(0, TEMPLATE_TITLE_MAX);
}

const KNOWN_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)books\.com\.tw$/, "博客來"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "YouTube"],
  [/(^|\.)hahow\.in$/, "Hahow"],
  [/(^|\.)coursera\.org$/, "Coursera"],
  [/(^|\.)medium\.com$/, "Medium"],
  [/(^|\.)notion\.so$/, "Notion"],
  [/(^|\.)daodao\.so$/, "島島阿學"],
];

/** 由 URL 推論資源名稱（原型 inferResourceName）；推不出回 null 讓使用者手動命名 */
export function inferResourceName(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const known = KNOWN_HOSTS.find(([pattern]) => pattern.test(host));
  if (known) return known[1];
  const segment = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "");
  if (segment && segment.length <= 40 && !/^[0-9a-f]{16,}$/i.test(segment)) {
    return `${segment}｜${host}`;
  }
  return host || null;
}

/** 只接受 HTTPS；回傳錯誤 key（i18n）或 null */
export function validateResourceUrl(value: string): "empty" | "invalid" | "https" | null {
  const trimmed = value.trim();
  if (!trimmed) return "empty";
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "invalid";
  }
  if (parsed.protocol !== "https:") return "https";
  return null;
}

/** URL 正規化（trim、host 小寫、去 hash、去尾斜線）供去重 */
export function normalizeResourceUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    url.hostname = url.hostname.toLowerCase();
    url.hash = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return value.trim().toLowerCase();
  }
}

/** 每週頻率：接受「1-3」「3~5」「5」；回 min/max 或 null（格式錯或超出 1–7） */
export function parseFrequency(value: string): { min: number; max: number } | null {
  const match = value.trim().match(/^(\d)\s*[-~–]\s*(\d)$|^(\d)$/);
  if (!match) return null;
  const min = Number(match[1] ?? match[3]);
  const max = Number(match[2] ?? match[3]);
  if (min < 1 || max > 7 || min > max) return null;
  return { min, max };
}

export function formatFrequency(min: number | null, max: number | null): string {
  if (min === null && max === null) return "";
  if (min === null) return String(max);
  if (max === null || min === max) return String(min);
  return `${min}-${max}`;
}

export interface SearchableTemplate {
  title: string;
  practiceAction: string | null;
  tags: string[];
  resources: Array<{ name: string; url: string | null }>;
  status: string;
}

/** 搜尋：模板名稱、實踐行動、標籤、資源名稱與連結、狀態文案（不分大小寫） */
export function templateMatches(
  template: SearchableTemplate,
  keyword: string,
  statusLabel: string
): boolean {
  const needle = keyword.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    template.title,
    template.practiceAction ?? "",
    ...template.tags,
    ...template.resources.flatMap((resource) => [resource.name, resource.url ?? ""]),
    statusLabel,
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(needle);
}

/** 產品時區（Asia/Taipei）的日曆日 YYYY-MM-DD */
export function todayInTaipei(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** 場次是否已開始：開始日（ISO）≤ 今天（FR-TPL-05 鎖定） */
export function isCohortStarted(startDate: string, now = new Date()): boolean {
  return startDate.slice(0, 10) <= todayInTaipei(now);
}

export function addDays(isoDate: string, days: number): string {
  const base = new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`);
  return new Date(base.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

/** 顯示用日期 YYYY/MM/DD */
export function formatSlashDate(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10).replace(/-/g, "/");
}

/** 唯一化複製名稱（前端只用來預估；正式名稱由後端決定） */
export function uniqueTitle(base: string, existing: Set<string>): string {
  if (!existing.has(base)) return base;
  for (let attempt = 2; attempt < 1000; attempt += 1) {
    const candidate = `${base} ${attempt}`;
    if (!existing.has(candidate)) return candidate;
  }
  return base;
}
