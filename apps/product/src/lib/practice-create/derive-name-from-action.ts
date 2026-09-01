/** 名稱上限字數（FR-1.10） */
export const PRACTICE_NAME_MAX_LENGTH = 20;

/** 第一子句視為「時間性短句」的長度門檻 */
const SHORT_CLAUSE_LENGTH = 10;

/** 子句切分符號：全形／半形逗號、句號、分號、頓號、換行 */
const CLAUSE_SEPARATOR = /[，,。.；;、\r\n]+/;

/** 時間性語彙 */
const TIME_TERMS = [
  "每天",
  "每週",
  "每周",
  "早上",
  "早晨",
  "中午",
  "下午",
  "晚上",
  "下班",
  "通勤",
  "睡前",
  "週末",
  "周末",
];

/** 時刻數字：七點、7點、07:00、7:00 */
const CLOCK_TIME = /(?:[零一二三四五六七八九十兩\d]{1,3}點|\d{1,2}[:：]\d{2})/;

function isTimeClause(clause: string): boolean {
  return TIME_TERMS.some((term) => clause.includes(term)) || CLOCK_TIME.test(clause);
}

function longest(clauses: string[]): string {
  return clauses.reduce((best, clause) => (clause.length > best.length ? clause : best), "");
}

/** 依 FR-1.10 由實踐行動推導名稱（純函式） */
export function deriveNameFromAction(action: string): string {
  const clauses = action
    .split(CLAUSE_SEPARATOR)
    .map((clause) => clause.trim())
    .filter((clause) => clause.length > 0);

  const [first, ...rest] = clauses;
  if (first === undefined) return "";

  let picked = first;

  if (first.length <= SHORT_CLAUSE_LENGTH && isTimeClause(first) && rest.length > 0) {
    const nonTime = rest.filter((clause) => !isTimeClause(clause));
    picked = longest(nonTime.length > 0 ? nonTime : rest);
  }

  return Array.from(picked).slice(0, PRACTICE_NAME_MAX_LENGTH).join("");
}
