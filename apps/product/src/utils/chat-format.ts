/**
 * 群組聊天的時間／預覽格式（daodao#154，對齊 POC 訊息.dc.html）。
 * 一律以 Asia/Taipei（UTC+8，無日光節約）計算，不受執行環境時區影響；
 * 只回傳資料，文字組裝交給 i18n（ICU）。
 */

const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 把 ISO 時間轉成「Taipei 牆上時間」的 UTC Date（之後只用 getUTC* 讀） */
function toTaipeiWall(iso: string): Date | null {
  const ms = new Date(iso).getTime();
  return Number.isNaN(ms) ? null : new Date(ms + TAIPEI_OFFSET_MS);
}

const pad = (n: number) => String(n).padStart(2, "0");

function dayNumber(wall: Date): number {
  return Math.floor(wall.getTime() / DAY_MS);
}

function weekdayShort(wall: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(wall);
}

/** Asia/Taipei 日曆日 key：yyyy/MM/dd */
export function chatDateKey(iso: string): string {
  const wall = toTaipeiWall(iso);
  if (!wall) return "";
  return `${wall.getUTCFullYear()}/${pad(wall.getUTCMonth() + 1)}/${pad(wall.getUTCDate())}`;
}

/** 短日期 M/d（Asia/Taipei），用於置頂訊息面板 */
export function chatShortDate(iso: string): string {
  const wall = toTaipeiWall(iso);
  return wall ? `${wall.getUTCMonth() + 1}/${wall.getUTCDate()}` : "";
}

/** 日期分隔線的組成（給 ICU `date_divider` 用）：zh「8 月 6 日 週三」、en「Wed, Aug 6」 */
export function chatDayLabelParts(
  dateKey: string,
  locale: string
): { month: number; day: number; weekday: string; monthName: string } {
  const [y, m, d] = dateKey.split("/").map(Number);
  const wall = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  return {
    month: m ?? 1,
    day: d ?? 1,
    weekday: weekdayShort(wall, locale),
    monthName: new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(wall),
  };
}

export type ChatRoomTimeLabel =
  | { kind: "just_now" }
  | { kind: "time"; value: string }
  | { kind: "yesterday" }
  | { kind: "weekday"; value: string }
  | { kind: "date"; value: string };

/** 聊天室列表右上角時間：剛剛／HH:mm／昨天／週二／8/12 */
export function chatRoomTimeLabel(iso: string, nowIso: string, locale: string): ChatRoomTimeLabel {
  const wall = toTaipeiWall(iso);
  const now = toTaipeiWall(nowIso);
  if (!wall || !now) return { kind: "date", value: "" };
  if (now.getTime() - wall.getTime() < 60 * 1000) return { kind: "just_now" };
  const diffDays = dayNumber(now) - dayNumber(wall);
  if (diffDays <= 0) {
    return { kind: "time", value: `${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}` };
  }
  if (diffDays === 1) return { kind: "yesterday" };
  if (diffDays < 7) return { kind: "weekday", value: weekdayShort(wall, locale) };
  return { kind: "date", value: `${wall.getUTCMonth() + 1}/${wall.getUTCDate()}` };
}

interface LastMessageLike {
  kind: string;
  bodyPreview: string;
  authorName: string | null;
  isMine: boolean;
}

export type ChatRoomPreview =
  | { kind: "none" }
  | { kind: "mine"; body: string }
  | { kind: "other"; name: string; body: string }
  | { kind: "plain"; body: string };

/** 聊天室列表最後一則預覽：「你：…」「小海：…」；系統訊息或已刪帳號只顯示內容 */
export function chatRoomPreview(last: LastMessageLike | null | undefined): ChatRoomPreview {
  if (!last) return { kind: "none" };
  if (last.kind === "system" || (!last.isMine && !last.authorName)) {
    return { kind: "plain", body: last.bodyPreview };
  }
  if (last.isMine) return { kind: "mine", body: last.bodyPreview };
  return { kind: "other", name: last.authorName ?? "", body: last.bodyPreview };
}
