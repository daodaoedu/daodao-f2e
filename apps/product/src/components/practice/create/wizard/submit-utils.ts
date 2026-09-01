/**
 * 送出流程的純函式：server 錯誤解析 → 表單欄位／步驟對應、成功回應 → 建立名稱清單
 */
import type { WizardFormValues } from "./schema";

export interface ServerErrorDetail {
  path?: string;
  message?: string;
}

export interface ParsedServerError {
  /** 頂層錯誤訊息（無 details 時的 fallback） */
  message: string | null;
  details: ServerErrorDetail[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * 解析 openapi-fetch 的 `response.error`。
 * server 可能回 `{ error: { message, details } }` 或直接 `{ message, details }`；
 * `details` 可能是 `[{ path, message }]` 陣列或 `{ [path]: message }` 物件。
 */
export const parseServerError = (error: unknown): ParsedServerError => {
  if (!isRecord(error)) return { message: null, details: [] };

  const inner = isRecord(error.error) ? error.error : error;
  const message = typeof inner.message === "string" && inner.message ? inner.message : null;

  const rawDetails = inner.details;
  let details: ServerErrorDetail[] = [];

  if (Array.isArray(rawDetails)) {
    details = rawDetails.filter(isRecord).map((d) => ({
      path: typeof d.path === "string" ? d.path : undefined,
      message: typeof d.message === "string" ? d.message : undefined,
    }));
  } else if (isRecord(rawDetails)) {
    details = Object.entries(rawDetails)
      .filter(([, v]) => typeof v === "string")
      .map(([path, msg]) => ({ path, message: String(msg) }));
  }

  return { message, details };
};

const STEP_1_FIELDS = new Set(["title", "practiceAction"]);
const STEP_2_FIELDS = new Set([
  "startDate",
  "durationDays",
  "frequencyMinDays",
  "frequencyMaxDays",
  "sessionDurationMinutes",
  "practiceTimePeriods",
  "otherContext",
]);
const STEP_3_FIELDS = new Set(["tags", "suggestedTags", "resources"]);

const SEGMENT_PATH = /^segments\.(\d+)(?:\.(.*))?$/;
const SEGMENTS_ROOT = "segments";

/** 取出 server 路徑的頂層欄位名（`resources.0.url` → `resources`） */
const rootOf = (path: string) => path.split(".")[0] ?? path;

/**
 * server 驗證錯誤路徑 → 應跳回的步驟；無法對應時回 null。
 * 拆段路徑（`segments.N.*`）一律屬於 Step 2。
 */
export const getStepForServerPath = (path: string): number | null => {
  const root = rootOf(path);
  if (root === SEGMENTS_ROOT) return 2;
  if (STEP_1_FIELDS.has(root)) return 1;
  if (STEP_2_FIELDS.has(root)) return 2;
  if (STEP_3_FIELDS.has(root)) return 3;
  return null;
};

const TOP_LEVEL_FIELD_MAP: Record<string, keyof WizardFormValues> = {
  title: "name",
  practiceAction: "action",
  startDate: "startDate",
  durationDays: "durationDays",
  frequencyMinDays: "frequency",
  frequencyMaxDays: "frequency",
  sessionDurationMinutes: "sessionMinutes",
  practiceTimePeriods: "timings",
  otherContext: "customTimings",
  tags: "tags",
  suggestedTags: "tags",
  resources: "resources",
};

const SEGMENT_FIELD_MAP: Record<string, string> = {
  title: "name",
  practiceAction: "action",
  durationDays: "days",
  frequencyMinDays: "frequency",
  frequencyMaxDays: "frequency",
  sessionDurationMinutes: "minutes",
  practiceTimePeriods: "timing",
  otherContext: "timing",
};

/**
 * server 驗證錯誤路徑 → react-hook-form 欄位路徑；無法對應時回 null。
 * - `title` → `name`、`practiceAction` → `action`、`frequencyMinDays` → `frequency` …
 * - `segments.1.durationDays` → `segments.1.days`；段落的 `startDate` 併回全域 `startDate`
 * - `resources.0.url` 之類的巢狀路徑保留原樣
 */
export const mapServerPathToFormField = (path: string): string | null => {
  if (path === SEGMENTS_ROOT) return SEGMENTS_ROOT;
  const segMatch = SEGMENT_PATH.exec(path);
  if (segMatch) {
    const index = segMatch[1];
    const rest = segMatch[2] ?? "";
    if (!rest) return SEGMENTS_ROOT;
    const field = rootOf(rest);
    if (field === "startDate") return "startDate";
    const mapped = SEGMENT_FIELD_MAP[field];
    if (!mapped) return null;
    return `segments.${index}.${mapped}`;
  }

  const root = rootOf(path);
  const mapped = TOP_LEVEL_FIELD_MAP[root];
  if (!mapped) return null;
  if (root === "resources") return path;
  return mapped;
};

/**
 * 從建立成功回應取出本次建立的名稱（順序與送出一致）：
 * 單筆 → `data.data.title`；批次 → `data.data.practices[].title` / `data.data.templates[].title`
 */
export const extractCreatedNames = (response: unknown): string[] => {
  if (!isRecord(response)) return [];
  const data = response.data;
  if (!isRecord(data)) return [];

  if (typeof data.title === "string") return [data.title];

  let list: unknown[] = [];
  if (Array.isArray(data.practices)) list = data.practices;
  else if (Array.isArray(data.templates)) list = data.templates;

  return list
    .filter(isRecord)
    .map((item) => item.title)
    .filter((title): title is string => typeof title === "string");
};
